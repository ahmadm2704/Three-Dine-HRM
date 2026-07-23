import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Verify credentials using Supabase Auth (Checks actual password)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // 2. Look up the employee record by email
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, email, job_title, employment_status, departments ( name )')
      .eq('email', email)
      .single();

    if (empError || !employee) {
       return NextResponse.json({ error: 'Employee account exists, but no profile was found in the database.' }, { status: 404 });
    }

    // 3. Fetch their actual role from Supabase Auth app_metadata
    let role = 'employee';
    if (authData.user.app_metadata?.role) {
      role = authData.user.app_metadata.role;
    } else {
      // Fallback check if it was missing from the session for some reason
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        const adminAuthUser = usersData.users.find(u => u.email === email);
        if (adminAuthUser?.app_metadata?.role) {
          role = adminAuthUser.app_metadata.role;
        }
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
