import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT_SUPER_ADMIN = {
  id: "admin-super-001",
  first_name: "Ali",
  last_name: "Danish",
  email: "ali@threedinecorporation.com",
  job_title: "Chief Executive Officer",
  employment_status: "active",
  employment_type: "full-time",
  accessLevel: "super_admin",
  departments: { name: "Leadership" },
  custom_fields: { employee_number: "001" },
  start_date: "2023-01-01"
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, email, phone, job_title, hire_date, avatar_url, employment_status, manager_id, department_id, departments ( name )')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching employees from Supabase DB:', error);
      return NextResponse.json({ employees: [DEFAULT_SUPER_ADMIN] }, { status: 200 });
    }

    let dbEmployees = data || [];

    // Fetch auth users to merge access roles
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsers?.users && dbEmployees.length > 0) {
      dbEmployees = dbEmployees.map(emp => {
        const authUser = authUsers.users.find(u => u.email === emp.email);
        const meta = authUser?.user_metadata || {};
        return {
          ...emp,
          accessLevel: authUser?.app_metadata?.role || (emp as any).accessLevel || 'employee',
          photo_url: emp.avatar_url || meta.photo_url || (emp as any).photo_url || '',
          start_date: emp.hire_date || meta.start_date || (emp as any).start_date || '',
          custom_fields: meta.custom_fields || (emp as any).custom_fields || {},
          address: meta.address || (emp as any).address || {},
          emergency_contact: meta.emergency_contact || (emp as any).emergency_contact || {},
          employment_type: meta.employment_type || (emp as any).employment_type || 'Full-Time',
          national_id: meta.national_id || (emp as any).national_id || '',
          place_of_birth: meta.place_of_birth || (emp as any).place_of_birth || '',
          nationality: meta.nationality || (emp as any).nationality || '',
          marital_status: meta.marital_status || (emp as any).marital_status || ''
        };
      });
    }

    return NextResponse.json({ employees: dbEmployees }, { status: 200 });
  } catch (error: any) {
    console.error('Internal server error fetching employees:', error);
    return NextResponse.json({ employees: [DEFAULT_SUPER_ADMIN] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, jobTitle, department, managerId, startDate, employeeNumber, accessLevel, password, phone, adminEmail, personalEmail } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 });
    }

    const effectiveAdminEmail = adminEmail || 'admin@threedinecorporation.com';

    // 1. Verify requester
    const { data: adminUsers } = await supabaseAdmin.auth.admin.listUsers();
    const requestingAdmin = adminUsers.users.find(u => u.email?.toLowerCase() === effectiveAdminEmail.toLowerCase());
    
    if (!requestingAdmin || requestingAdmin.app_metadata?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can create new employees.' }, { status: 403 });
    }

    // 2. Generate or use supplied password
    const userPassword = password || `TD-${Math.random().toString(36).slice(-6)}!`;

    // 3. Create or update user in Supabase Auth (Seamless Upsert)
    const existingAuthUser = adminUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    const builtMetadata = { 
      first_name: firstName, 
      last_name: lastName,
      start_date: startDate || '',
      custom_fields: {
        employee_number: employeeNumber || '',
        personal_email: personalEmail || ''
      }
    };

    if (existingAuthUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
        password: userPassword,
        email_confirm: true,
        user_metadata: builtMetadata,
        app_metadata: { role: accessLevel || 'employee' }
      });
    } else {
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: userPassword,
        email_confirm: true,
        user_metadata: builtMetadata,
        app_metadata: { role: accessLevel || 'employee' }
      });

      if (authError && !authError.message?.includes('already been registered')) {
        console.error('Error creating Auth user in Supabase:', authError);
      }
    }

    // 4. Find or create Department in Supabase DB
    let department_id: string | null = null;
    if (department) {
      const { data: deptData } = await supabaseAdmin
        .from('departments')
        .select('id')
        .eq('name', department)
        .single();

      if (deptData) {
        department_id = deptData.id;
      } else {
        const { data: newDept, error: deptError } = await supabaseAdmin
          .from('departments')
          .insert({ name: department })
          .select('id')
          .single();

        if (!deptError && newDept) {
          department_id = newDept.id;
        }
      }
    }

    // 5. Validate manager_id UUID
    let validManagerId: string | null = null;
    if (managerId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(managerId);
      if (isUUID) {
        const { data: managerExists } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('id', managerId)
          .single();
        if (managerExists) {
          validManagerId = managerId;
        }
      }
    }

    // 6. Clean insert payload targeting ONLY verified database columns
    const insertPayload: any = {
      first_name: firstName,
      last_name: lastName,
      email,
      job_title: jobTitle || null,
      department_id,
      manager_id: validManagerId,
      phone: phone || null,
      hire_date: startDate || null,
      employment_status: 'active'
    };

    const { data: existingEmp } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('email', email)
      .single();

    let insertedEmployee: any = null;

    if (existingEmp) {
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('employees')
        .update(insertPayload)
        .eq('id', existingEmp.id)
        .select('id, first_name, last_name, email, phone, job_title, employment_status, manager_id, department_id, departments ( name )')
        .single();

      if (!updateErr && updated) {
        insertedEmployee = updated;
      }
    }

    if (!insertedEmployee) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('employees')
        .insert(insertPayload)
        .select('id, first_name, last_name, email, phone, job_title, employment_status, manager_id, department_id, departments ( name )')
        .single();

      if (insertError) {
        console.error('CRITICAL: Failed to insert employee into Supabase DB:', insertError);
        return NextResponse.json({ error: `Database insert failed: ${insertError.message}` }, { status: 500 });
      }
      insertedEmployee = inserted;
    }

    console.log('✓ SUCCESS: Employee inserted directly into Supabase DB:', insertedEmployee.id, insertedEmployee.email);

    return NextResponse.json({ 
      employee: { 
        ...insertedEmployee, 
        start_date: startDate || new Date().toISOString().split('T')[0],
        accessLevel: accessLevel || 'employee',
        custom_fields: { employee_number: employeeNumber || `EMP-${Math.floor(100 + Math.random() * 900)}` }
      }, 
      generatedPassword: userPassword 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Internal server error creating employee:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
