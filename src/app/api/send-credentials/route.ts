import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, email, personalEmail, password, role, department } = body;

    // Check if SMTP credentials exist
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        { error: 'SMTP credentials not configured in .env.local' },
        { status: 500 }
      );
    }

    const finalPassword = password || 'TD-9x82q!';
    const loginUrl = 'https://hrm.threedinecorporation.com/login';

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 1. Admin Notification Mail
    const adminMailOptions = {
      from: process.env.SMTP_EMAIL,
      to: 'ahmad@threedinecorporation.com', 
      subject: `New Employee Onboarded: ${firstName}`,
      text: `Hello Admin,\n\nA new employee profile has been created for ${firstName}.\n\nCredentials Details:\nName: ${firstName}\nWork Email: ${email}\nPersonal Email: ${personalEmail || 'N/A'}\nTemporary Password: ${finalPassword}\nRole: ${role}\nDepartment: ${department}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">New Employee Profile Created</h2>
          <p>A new employee profile has been onboarded for <strong>${firstName}</strong>.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Name:</strong> ${firstName}</p>
            <p><strong>Work Email:</strong> ${email}</p>
            <p><strong>Personal Email:</strong> ${personalEmail || 'N/A'}</p>
            <p><strong>Temporary Password:</strong> <span style="font-size: 16px; font-weight: bold; color: #2563eb; background: #dbeafe; padding: 4px 10px; border-radius: 6px;">${finalPassword}</span></p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Department:</strong> ${department}</p>
          </div>
        </div>
      `,
    };

    // 2. Employee Welcome Email
    const targetEmail = personalEmail || email;

    const employeeMailOptions = {
      from: process.env.SMTP_EMAIL,
      to: targetEmail,
      subject: `Welcome to Three Dine Technology, ${firstName}! 🎉`,
      text: `Welcome aboard, ${firstName}!\n\nWe are thrilled to have you join the ${department} team as our new ${role}.\n\nHere are your login credentials for the portal:\nLogin URL: ${loginUrl}\nWork Email: ${email}\nTemporary Password: ${finalPassword}\n\nPlease log in to view your onboarding tasks.\n\nBest regards,\nThree Dine Technology`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; margin-top: 0;">Welcome to Three Dine Technology! 🎉</h2>
          <p style="font-size: 15px; color: #334155;">Welcome aboard, <strong>${firstName}</strong>!</p>
          <p style="font-size: 14px; color: #475569;">We are thrilled to have you join the <strong>${department}</strong> team as our new <strong>${role}</strong>.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 10px; margin: 24px 0; border: 1px solid #cbd5e1;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Your Portal Access Credentials</h3>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none;">${loginUrl}</a></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Work Email:</strong> <span style="color: #0f172a; font-weight: bold;">${email}</span></p>
            <p style="margin: 12px 0 8px 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="font-size: 16px; font-weight: bold; color: #1e40af; background-color: #dbeafe; padding: 6px 12px; border-radius: 6px; border: 1px solid #bfdbfe;">${finalPassword}</code></p>
          </div>
          
          <p style="font-size: 14px; color: #475569;">Please log in to the portal to view your onboarding tasks and update your password.</p>
          <br/>
          <p style="font-size: 14px; color: #334155; margin-bottom: 0;">Best regards,<br/><strong style="color: #0f172a;">Three Dine Technology HR</strong></p>
        </div>
      `,
    };

    // Send emails
    await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(employeeMailOptions)
    ]);

    return NextResponse.json({ success: true, message: 'Emails sent successfully', password: finalPassword });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
