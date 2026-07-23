import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, oldPassword, newPassword } = await request.json();

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Email, current password, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // 1. Verify the old password by attempting to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 401 });
    }

    // 2. Use Admin API to securely update the password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    // The user's password is now securely updated.
    return NextResponse.json({ success: true, message: 'Password successfully changed.' }, { status: 200 });

  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during password change.' }, { status: 500 });
  }
}
