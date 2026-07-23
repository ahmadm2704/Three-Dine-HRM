import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // 1. Find the employee in the database
    const { data: employee, error: dbError } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, email, personal_email')
      .eq('email', email)
      .single();

    if (dbError || !employee) {
      return NextResponse.json(
        { error: 'No employee found with that work email address.' },
        { status: 404 }
      );
    }

    // 2. Find the user in Supabase Auth
    const { data: usersData, error: authListError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authListError || !usersData?.users) {
      return NextResponse.json({ error: 'Failed to access authentication records.' }, { status: 500 });
    }

    const authUser = usersData.users.find((u) => u.email === email);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication record not found for this employee.' }, { status: 404 });
    }

    // 3. Generate a temporary secure password
    const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + '1!Aa';

    // 4. Update the user's password in Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      { password: tempPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user password securely.' }, { status: 500 });
    }

    // 5. Send the new password via email
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        { error: 'SMTP credentials not configured. Password was reset but could not be emailed.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const targetEmail = employee.personal_email || employee.email;
    const loginUrl = 'https://hrm.threedinecorporation.com/login'; // Adjust to real domain if necessary

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: targetEmail,
      subject: 'Password Reset - Three Dine HR Platform',
      text: `Hello ${employee.first_name},\n\nYour password for the Three Dine HR Platform has been reset.\n\nYour new temporary password is: ${tempPassword}\n\nPlease login using your work email: ${employee.email}\nLogin URL: ${loginUrl}\n\nBest regards,\nThree Dine Technology`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">Password Reset Complete</h2>
          <p>Hello <strong>${employee.first_name}</strong>,</p>
          <p>A request was made to reset the password for your Three Dine HR Platform account.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0;"><strong>Work Email:</strong> ${employee.email}</p>
            <p style="margin: 0;"><strong>New Temporary Password:</strong> 
              <span style="font-size: 16px; font-weight: bold; color: #1e40af; background: #dbeafe; padding: 4px 10px; border-radius: 6px;">${tempPassword}</span>
            </p>
          </div>
          
          <p>You can now log in here: <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
          <br/>
          <p style="color: #64748b; font-size: 14px;">If you did not request this change, please contact IT support immediately.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Password successfully reset. An email has been sent to your personal address.',
      targetEmailHint: employee.personal_email ? 'personal email' : 'work email'
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during password reset.' }, { status: 500 });
  }
}
