import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract all text fields
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = value;
      }
    }

    // Handle File Uploads
    const fileFields = ['resume', 'degrees', 'certifications', 'experience_letters', 'cnic_doc'];
    const fileUrls: Record<string, string> = {};

    for (const field of fileFields) {
      const file = formData.get(field) as File | null;
      if (file && file.size > 0) {
        // Upload to Supabase Storage using service role
        const fileExt = file.name.split('.').pop();
        const fileName = `${data.name.replace(/\s+/g, '_')}_${field}_${Date.now()}.${fileExt}`;
        const filePath = `staff_documents/${fileName}`;
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
          // If the bucket doesn't exist, we'll continue anyway to at least save the text data
          // But ideally the user creates the bucket.
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabaseAdmin.storage.from('documents').getPublicUrl(filePath);
          fileUrls[`${field}_url`] = publicUrl;
        }
      }
    }
    
    // Insert into database
    const { error: dbError } = await supabaseAdmin
      .from('staff')
      .insert([
        {
          name: data.name,
          father_name: data.father_name,
          cnic: data.cnic,
          nationality: data.nationality,
          passport_number: data.passport_number,
          tax_registered: data.tax_registered,
          tax_jurisdiction: data.tax_jurisdiction,
          
          mobile_number: data.mobile_number,
          whatsapp_number: data.whatsapp_number,
          email: data.email,
          residential_address: data.residential_address,
          time_zone: data.time_zone,
          
          emergency_contact_name: data.emergency_contact_name,
          emergency_relationship: data.emergency_relationship,
          emergency_mobile: data.emergency_mobile,
          emergency_whatsapp: data.emergency_whatsapp,
          
          last_employer_name: data.last_employer_name,
          last_employer_contact: data.last_employer_contact,
          years_of_experience: data.years_of_experience,
          total_experience: data.total_experience,
          last_drawn_salary: data.last_drawn_salary,
          
          ref1_name: data.ref1_name,
          ref1_organization: data.ref1_organization,
          ref1_designation: data.ref1_designation,
          ref1_mobile: data.ref1_mobile,
          ref1_whatsapp: data.ref1_whatsapp,
          ref1_email: data.ref1_email,
          
          ref2_name: data.ref2_name,
          ref2_organization: data.ref2_organization,
          ref2_designation: data.ref2_designation,
          ref2_mobile: data.ref2_mobile,
          ref2_whatsapp: data.ref2_whatsapp,
          ref2_email: data.ref2_email,
          
          bank1_name: data.bank1_name,
          bank1_branch: data.bank1_branch,
          bank1_iban: data.bank1_iban,
          bank1_currency: data.bank1_currency,
          
          bank2_name: data.bank2_name,
          bank2_branch: data.bank2_branch,
          bank2_iban: data.bank2_iban,
          bank2_currency: data.bank2_currency,

          resume_url: fileUrls['resume_url'] || null,
          degrees_url: fileUrls['degrees_url'] || null,
          certifications_url: fileUrls['certifications_url'] || null,
          experience_letters_url: fileUrls['experience_letters_url'] || null,
          cnic_url: fileUrls['cnic_doc_url'] || null,
          
          status: 'Pending Review'
        }
      ]);

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
