import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use admin client to bypass RLS, because the user is not yet authenticated in Supabase
    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, email, job_title')
      .eq('email', email)
      .single();

    if (error || !employee) {
      console.error('Error fetching employee:', error);
      return NextResponse.json({ error: 'Employee not found' }, { status: 400 });
    }

    // Get their role (table may not exist yet)
    let role = 'employee';
    try {
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('employee_id', employee.id)
        .single();
      if (roleData?.role) role = roleData.role;
    } catch {
      // user_roles table may not exist — default to 'employee'
    }

    return NextResponse.json({ 
      employee: {
        ...employee,
        role
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
