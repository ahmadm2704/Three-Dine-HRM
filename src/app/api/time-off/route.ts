import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { employee_id, type, start_date, end_date, days_count, reason, status } = payload;

    // 1. Insert into database
    const { data: requestData, error: insertError } = await supabaseAdmin
      .from('time_off_requests')
      .insert({
        employee_id, type, start_date, end_date, days_count, reason, status
      })
      .select('*, employees!time_off_requests_employee_id_fkey(first_name, last_name, email)')
      .single();

    if (insertError || !requestData) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to insert request into database.' }, { status: 500 });
    }

    const employee = requestData.employees;

    // 2. Prepare emails
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ success: true, message: 'Request saved, but emails could not be sent due to missing SMTP config.', data: requestData });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Fetch Auth Users to get personal emails and identify super_admins
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    
    let superAdminEmails: string[] = [];
    let employeePersonalEmail: string | null = null;

    if (authData?.users) {
      authData.users.forEach(u => {
        const isSuperAdmin = u.app_metadata?.role === 'super_admin';
        const personalEmail = u.user_metadata?.custom_fields?.personal_email;
        const workEmail = u.email;

        if (isSuperAdmin) {
          if (workEmail) superAdminEmails.push(workEmail);
          if (personalEmail) superAdminEmails.push(personalEmail);
        }

        if (workEmail === employee.email) {
          employeePersonalEmail = personalEmail || null;
        }
      });
    }

    // Deduplicate superadmin emails
    superAdminEmails = [...new Set(superAdminEmails)];

    // 4. Construct and send Super Admin Email
    if (superAdminEmails.length > 0) {
      const adminMailOptions = {
        from: process.env.SMTP_EMAIL,
        to: superAdminEmails.join(','),
        subject: `[ACTION REQUIRED] New Time-Off Request: ${employee.first_name} ${employee.last_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb; margin-top: 0;">New Time-Off Request</h2>
            <p><strong>${employee.first_name} ${employee.last_name}</strong> has submitted a new time-off request that requires your review.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>Type:</strong> <span style="text-transform: uppercase;">${type}</span></p>
              <p><strong>Dates:</strong> ${start_date} to ${end_date} (${days_count} days)</p>
              <p><strong>Reason:</strong> ${reason || 'N/A'}</p>
            </div>
            <p>Please log in to the <a href="https://hrm.threedinecorporation.com/dashboard" style="color: #2563eb;">HR Dashboard</a> to approve or reject this request.</p>
          </div>
        `
      };
      await transporter.sendMail(adminMailOptions);
    }

    // 5. Construct and send Employee Confirmation Email
    if (employeePersonalEmail) {
      const empMailOptions = {
        from: process.env.SMTP_EMAIL,
        to: employeePersonalEmail,
        subject: `Time-Off Request Submitted Successfully`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #10b981; margin-top: 0;">Request Submitted</h2>
            <p>Hello <strong>${employee.first_name}</strong>,</p>
            <p>Your time-off request has been successfully submitted and is currently pending review by a super admin.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>Type:</strong> <span style="text-transform: uppercase;">${type}</span></p>
              <p><strong>Dates:</strong> ${start_date} to ${end_date} (${days_count} days)</p>
              <p><strong>Reason:</strong> ${reason || 'N/A'}</p>
            </div>
            <p>You will be notified once the request is processed.</p>
          </div>
        `
      };
      await transporter.sendMail(empMailOptions);
    }

    return NextResponse.json({ success: true, data: requestData }, { status: 201 });
  } catch (err: any) {
    console.error('Time-off submission error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const { id, status } = payload;

    // 1. Update the database record
    const { data: requestData, error: updateError } = await supabaseAdmin
      .from('time_off_requests')
      .update({ status })
      .eq('id', id)
      .select('*, employees!time_off_requests_employee_id_fkey(first_name, last_name, email)')
      .single();

    if (updateError || !requestData) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update request status in database.' }, { status: 500 });
    }

    const employee = requestData.employees;

    // 2. Prepare emails
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ success: true, message: 'Status updated, but emails could not be sent due to missing SMTP config.', data: requestData });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Fetch Auth Users to get personal emails and identify super_admins
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    
    let superAdminEmails: string[] = [];
    let employeePersonalEmail: string | null = null;

    if (authData?.users) {
      authData.users.forEach(u => {
        const isSuperAdmin = u.app_metadata?.role === 'super_admin';
        const personalEmail = u.user_metadata?.custom_fields?.personal_email;
        const workEmail = u.email;

        if (isSuperAdmin) {
          if (workEmail) superAdminEmails.push(workEmail);
          if (personalEmail) superAdminEmails.push(personalEmail);
        }

        if (workEmail === employee.email) {
          employeePersonalEmail = personalEmail || null;
        }
      });
    }

    // Deduplicate superadmin emails
    superAdminEmails = [...new Set(superAdminEmails)];
    
    const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
    const statusText = status.toUpperCase();

    // 4. Construct and send Super Admin Alert Email
    if (superAdminEmails.length > 0) {
      const adminMailOptions = {
        from: process.env.SMTP_EMAIL,
        to: superAdminEmails.join(','),
        subject: `[TIME-OFF ${statusText}] ${employee.first_name} ${employee.last_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: ${statusColor}; margin-top: 0;">Time-Off Request ${statusText}</h2>
            <p>A time-off request for <strong>${employee.first_name} ${employee.last_name}</strong> has been marked as <strong>${statusText}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>Type:</strong> <span style="text-transform: uppercase;">${requestData.type}</span></p>
              <p><strong>Dates:</strong> ${requestData.start_date} to ${requestData.end_date} (${requestData.days_count} days)</p>
            </div>
            <p>You can view all records in the <a href="https://hrm.threedinecorporation.com/dashboard" style="color: #2563eb;">HR Dashboard</a>.</p>
          </div>
        `
      };
      await transporter.sendMail(adminMailOptions);
    }

    // 5. Construct and send Employee Final Decision Email
    if (employeePersonalEmail) {
      const empMailOptions = {
        from: process.env.SMTP_EMAIL,
        to: employeePersonalEmail,
        subject: `Decision: Your Time-Off Request is ${statusText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: ${statusColor}; margin-top: 0;">Request ${statusText}</h2>
            <p>Hello <strong>${employee.first_name}</strong>,</p>
            <p>Your time-off request has been reviewed and is now <strong>${statusText}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>Type:</strong> <span style="text-transform: uppercase;">${requestData.type}</span></p>
              <p><strong>Dates:</strong> ${requestData.start_date} to ${requestData.end_date} (${requestData.days_count} days)</p>
            </div>
            <p>If you have any questions, please contact your manager.</p>
          </div>
        `
      };
      await transporter.sendMail(empMailOptions);
    }

    return NextResponse.json({ success: true, data: requestData }, { status: 200 });
  } catch (err: any) {
    console.error('Time-off status update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
