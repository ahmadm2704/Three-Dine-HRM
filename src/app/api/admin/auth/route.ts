import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { action, password, newPassword } = await request.json();

    // Fetch the current password from DB
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (error) {
      console.error('Error fetching password:', error);
      return NextResponse.json({ error: 'Database configuration error. Please run the latest SQL schema.' }, { status: 500 });
    }

    const currentPassword = data?.value;

    if (action === 'login') {
      if (password === currentPassword) {
        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
    } 
    
    if (action === 'change_password') {
      if (password !== currentPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      // Update the password
      const { error: updateError } = await supabaseAdmin
        .from('admin_settings')
        .update({ value: newPassword })
        .eq('key', 'admin_password');

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
