import { Resend } from 'resend';

export const sendVerificationEmail = async ({ email, name, otp }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Job Application Tracker <onboarding@resend.dev>';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px;">
        <div style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; font-size: 18px;">
          Job Application Tracker
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Verify Your Email Address</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hi <strong>${name || 'User'}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Thank you for signing up for Job Application Tracker! Please use the following 6-digit verification code to complete your registration:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background-color: #eeef2e1; padding: 14px 28px; border-radius: 12px; border: 2px dashed #6366f1; display: inline-block;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
          ⏰ This verification code will expire in <strong>10 minutes</strong>. If you did not create an account, please ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        © Job Application Tracker. All rights reserved.
      </div>
    </div>
  `;

  if (apiKey) {
    console.log(`Sending Resend verification email to ${email}...`);
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `${otp} is your verification code for Job Tracker`,
        html: htmlContent,
      });

      if (error) {
        console.error(`Resend API error:`, error.message || error);
        const errStr = typeof error === 'string' ? error : JSON.stringify(error);
        const isDomainRestriction = errStr.includes('only send testing emails') || errStr.includes('validation_error');
        return {
          sent: false,
          mode: isDomainRestriction ? 'resend_restriction' : 'dev_fallback',
          error: error.message || errStr,
          otp,
        };
      }

      console.log(`Verification email successfully sent via Resend to ${email}. ID: ${data?.id}`);
      return { sent: true, mode: 'resend', id: data?.id };
    } catch (error) {
      console.error(`Failed to send email via Resend:`, error.message);
      const isDomainRestriction = error.message?.includes('only send testing emails');
      return {
        sent: false,
        mode: isDomainRestriction ? 'resend_restriction' : 'dev_fallback',
        error: error.message,
        otp,
      };
    }
  } else {
    console.log(`\n========================================`);
    console.log(`[RESEND VERIFICATION DEMO MODE]`);
    console.log(`Recipient: ${email}`);
    console.log(`Verification OTP: ${otp}`);
    console.log(`RESEND_API_KEY not set in environment.`);
    console.log(`========================================\n`);
    return { sent: false, mode: 'demo', otp };
  }
};

export const sendPasswordResetEmail = async ({ email, name, otp }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Job Application Tracker <onboarding@resend.dev>';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px;">
        <div style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; font-size: 18px;">
          Job Application Tracker
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hi <strong>${name || 'User'}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password for Job Application Tracker. Please use the following 6-digit verification code:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #dc2626; background-color: #fef2f2; padding: 14px 28px; border-radius: 12px; border: 2px dashed #f87171; display: inline-block;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
          ⏰ This password reset code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        © Job Application Tracker. All rights reserved.
      </div>
    </div>
  `;

  if (apiKey) {
    console.log(`Sending Resend password reset email to ${email}...`);
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `${otp} is your password reset code for Job Tracker`,
        html: htmlContent,
      });

      if (error) {
        console.error(`Resend API error:`, error.message || error);
        const errStr = typeof error === 'string' ? error : JSON.stringify(error);
        const isDomainRestriction = errStr.includes('only send testing emails') || errStr.includes('validation_error');
        return {
          sent: false,
          mode: isDomainRestriction ? 'resend_restriction' : 'dev_fallback',
          error: error.message || errStr,
          otp,
        };
      }

      console.log(`Password reset email successfully sent via Resend to ${email}. ID: ${data?.id}`);
      return { sent: true, mode: 'resend', id: data?.id };
    } catch (error) {
      console.error(`Failed to send password reset email via Resend:`, error.message);
      const isDomainRestriction = error.message?.includes('only send testing emails');
      return {
        sent: false,
        mode: isDomainRestriction ? 'resend_restriction' : 'dev_fallback',
        error: error.message,
        otp,
      };
    }
  } else {
    console.log(`\n========================================`);
    console.log(`[RESEND PASSWORD RESET OTP DEMO MODE]`);
    console.log(`Recipient: ${email}`);
    console.log(`Password Reset OTP: ${otp}`);
    console.log(`RESEND_API_KEY not set in environment.`);
    console.log(`========================================\n`);
    return { sent: false, mode: 'demo', otp };
  }
};

