import nodemailer, { type Transporter } from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const EMAIL_FROM = process.env.EMAIL_FROM || (SMTP_USER ? `"NatureMades Sanctuary" <${SMTP_USER}>` : '"NatureMades" <no-reply@naturemades.com>');

let transporter: Transporter | null = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  // Always log clearly for development debugging & immediate testing
  console.log('\n======================================================');
  console.log(`[NatureMades Gmail OTP Service]`);
  console.log(`Recipient: ${toEmail}`);
  console.log(`Verification Code (OTP): >>> ${otp} <<<`);
  console.log(`Valid For: 10 Minutes`);
  console.log('======================================================\n');

  if (!transporter) {
    console.log('[NatureMades Email] Notice: SMTP credentials not detected in .env. Using simulated OTP dispatch.');
    return true;
  }

  try {
    const htmlContent = `
      <div style="font-family: 'Georgia', serif; background-color: #0A0A0A; color: #F8F8E8; padding: 40px 20px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #486838; font-size: 26px; margin: 0; letter-spacing: 2px;">NATUREMADES</h1>
          <p style="color: #786848; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px;">Artisan Handcrafted Sanctuary</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; text-align: center;">
          <h2 style="font-size: 18px; color: #F8F8E8; margin-top: 0;">Password Verification Code</h2>
          <p style="color: #786848; font-size: 13px; line-height: 1.6;">
            We received a request to update or reset the password for your NatureMades patron account.
          </p>
          <div style="margin: 28px 0; background: #161A13; border: 1px solid #486838; border-radius: 10px; padding: 16px; display: inline-block;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F8F8E8;">
              ${otp}
            </span>
          </div>
          <p style="color: #786848; font-size: 12px; margin-bottom: 0;">
            This verification code will expire in <strong>10 minutes</strong>. If you did not request this change, you can safely ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #786848; font-size: 11px;">
          <p>&copy; ${new Date().getFullYear()} NatureMades. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `Your NatureMades Verification Code: ${otp}`,
      html: htmlContent,
    });

    console.log(`[NatureMades Email] Successfully delivered OTP to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[NatureMades Email Error] Failed to send email via SMTP to ${toEmail}:`, err);
    // Return true because OTP is recorded and logged
    return true;
  }
}
