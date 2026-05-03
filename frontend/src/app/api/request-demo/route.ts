import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, phone, company } = await req.json();

    if (!name || !email || !phone || !company) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 1. Send confirmation email to the user
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email, // Standard flow: to the user
      subject: "Demo Request Received - Let's Schedule!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 16px;">Hello ${name},</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Thanks for your interest in HybridEstimate! We've received your request for a demo.</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Our team will contact you shortly at <strong>${email}</strong> or <strong>${phone}</strong> to schedule a time that works best for you.</p>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">This is an automated confirmation from the HybridEstimate team.</p>
          </div>
        </div>
      `,
    });

    // 2. Send notification email to the admin team
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Standard flow: to the admin
      subject: `🚨 NEW DEMO REQUEST: ${company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 16px;">New Demo Lead</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">A new demo request has been submitted with the following details:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #6b7280; width: 120px;">Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #6b7280;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #6b7280;">Phone</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #6b7280;">Company</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${company}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Demo request processed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Nodemailer Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
