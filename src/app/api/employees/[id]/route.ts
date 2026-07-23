import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, email, phone, job_title, hire_date, avatar_url, employment_status, manager_id, department_id, departments ( name )')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 400 });
    }

    return NextResponse.json({ employee: data }, { status: 200 });
  } catch (error: any) {
    console.error('Internal server error during GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { data: employeeToFind } = await supabaseAdmin
      .from('employees')
      .select('manager_id, email')
      .eq('id', id)
      .single();
      
    const parentManagerId = employeeToFind?.manager_id || null;
    const employeeEmail = employeeToFind?.email;

    await Promise.allSettled([
      supabaseAdmin.from('employees').update({ manager_id: parentManagerId }).eq('manager_id', id),
      supabaseAdmin.from('documents').update({ uploaded_by: null }).eq('uploaded_by', id),
      supabaseAdmin.from('audit_log').update({ actor_id: null }).eq('actor_id', id),
    ]);

    const { error: deleteDbError } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', id);

    if (deleteDbError) {
      console.error('Error deleting employee from database:', deleteDbError);
      return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
    }

    if (employeeEmail) {
      const { data: adminUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authUserToDelete = adminUsers.users.find(u => u.email === employeeEmail);
      if (authUserToDelete) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUserToDelete.id);
        if (deleteAuthError) {
          console.error("Warning: Could not delete auth user:", deleteAuthError);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Internal server error during deletion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      return NextResponse.json({ employee: body }, { status: 200 });
    }

    if (body.accessLevel) {
      if (!body.adminEmail) {
        return NextResponse.json({ error: 'Unauthorized. Admin credentials missing.' }, { status: 401 });
      }

      const { data: adminUsers } = await supabaseAdmin.auth.admin.listUsers();
      const requestingAdmin = adminUsers.users.find(u => u.email === body.adminEmail);
      
      if (!requestingAdmin || requestingAdmin.app_metadata?.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden. Only Super Admins can change employee roles.' }, { status: 403 });
      }
    }

    // Build the update payload using existing table columns
    const updateData: any = {};
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.job_title !== undefined) updateData.job_title = body.job_title;
    if (body.manager_id !== undefined) updateData.manager_id = body.manager_id;
    if (body.start_date !== undefined) updateData.hire_date = body.start_date;
    if (body.employment_status !== undefined) updateData.employment_status = body.employment_status;
    if (body.photo_url !== undefined) updateData.avatar_url = body.photo_url;
    
    // Extract natively supported fields that might come wrapped in custom_fields or at the root level
    if (body.employee_number !== undefined) updateData.employee_number = body.employee_number;
    if (body.personal_email !== undefined) updateData.personal_email = body.personal_email;
    if (body.custom_fields?.employee_number !== undefined) updateData.employee_number = body.custom_fields.employee_number;
    if (body.custom_fields?.personal_email !== undefined) updateData.personal_email = body.custom_fields.personal_email;

    // Handle department by name
    if (body.department_name) {
      let { data: dept } = await supabaseAdmin
        .from('departments')
        .select('id')
        .eq('name', body.department_name)
        .single();

      if (!dept) {
        const { data: newDept } = await supabaseAdmin
          .from('departments')
          .insert({ name: body.department_name })
          .select('id')
          .single();
        dept = newDept;
      }

      if (dept) updateData.department_id = dept.id;
    }

    const { data, error } = await supabaseAdmin
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select('id, first_name, last_name, email, phone, job_title, hire_date, manager_id, employment_status, departments ( name )')
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data?.email) {
      const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authUserToUpdate = allUsers.users.find(u => u.email === data.email);
      
      if (authUserToUpdate) {
        const currentMeta = authUserToUpdate.app_metadata || {};
        const currentUserMeta = authUserToUpdate.user_metadata || {};
        
        let updatePayload: any = {};
        if (body.accessLevel) {
          updatePayload.app_metadata = { ...currentMeta, role: body.accessLevel };
        }
        
        // Save non-DB columns to user_metadata seamlessly
        let newUserMeta = { ...currentUserMeta };
        let metaChanged = false;
        
        const metadataFields = ['photo_url', 'start_date', 'custom_fields', 'address', 'emergency_contact', 'employment_type', 'national_id', 'place_of_birth', 'nationality', 'marital_status'];
        
        for (const field of metadataFields) {
          if (body[field] !== undefined) {
            newUserMeta[field] = body[field];
            metaChanged = true;
          }
        }
        
        // Flatten nested personal fields from custom_fields if they exist
        if (body.custom_fields) {
          const cf = body.custom_fields;
          const flatFields = ['national_id', 'place_of_birth', 'nationality', 'marital_status'];
          for (const flat of flatFields) {
            if (cf[flat] !== undefined) {
              newUserMeta[flat] = cf[flat];
              metaChanged = true;
            }
          }
        }

        // Specifically handle nested custom fields coming from directory edits
        if (body.employee_number !== undefined || body.personal_email !== undefined) {
          newUserMeta.custom_fields = newUserMeta.custom_fields || {};
          if (body.employee_number !== undefined) newUserMeta.custom_fields.employee_number = body.employee_number;
          if (body.personal_email !== undefined) newUserMeta.custom_fields.personal_email = body.personal_email;
          metaChanged = true;
        }
        
        if (metaChanged) {
           updatePayload.user_metadata = newUserMeta;
        }

        if (Object.keys(updatePayload).length > 0) {
          const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(authUserToUpdate.id, updatePayload);
          if (authErr) console.error("Warning: Failed to update auth metadata:", authErr);
        }
      }
    }

    return NextResponse.json({ employee: { ...data, accessLevel: body.accessLevel, ...(body.photo_url ? { photo_url: body.photo_url } : {}) } }, { status: 200 });
  } catch (error: any) {
    console.error('Internal server error during update:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
