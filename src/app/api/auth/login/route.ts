import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // 1 & 2. Development bypass: Look up the employee record by email, or grab the first available
    let { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, email, job_title, employment_status, departments ( name )')
      .eq('email', email)
      .single();

    if (empError || !employee) {
      console.warn('Employee email not found, attempting to login with fallback user...');
      const { data: fallbackEmployees } = await supabaseAdmin
        .from('employees')
        .select('id, first_name, last_name, email, job_title, employment_status, departments ( name )')
        .limit(1);

      if (fallbackEmployees && fallbackEmployees.length > 0) {
        employee = fallbackEmployees[0];
      } else {
        return NextResponse.json({ error: 'No employee accounts exist in the database.' }, { status: 400 });
      }
    }

    // 3. Fetch their actual role from Supabase Auth app_metadata
    let role = 'employee';
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!usersError && usersData?.users) {
      const authUser = usersData.users.find(u => u.email === employee?.email);
      if (authUser?.app_metadata?.role) {
        role = authUser.app_metadata.role;
      }
    }

    return NextResponse.json({
      success: true,
      employee: {
        ...employee,
        role,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message, stack: error.stack }, { status: 500 });
  }
}
