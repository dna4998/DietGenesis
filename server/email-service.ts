import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not found - email notifications will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface PatientWelcomeEmailParams {
  patientName: string;
  patientEmail: string;
  loginEmail: string;
  password: string;
  appUrl: string;
  providerName: string;
}

export async function sendPatientWelcomeEmail(params: PatientWelcomeEmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email notification');
    return false;
  }

  try {
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DNA Diet Club</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #0ea5e9; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0ea5e9; }
            .content { padding: 20px 0; }
            .credentials { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .button { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🧬 DNA Diet Club</div>
                <p style="margin: 10px 0 0 0; color: #64748b;">Personalized Health & Nutrition Platform</p>
            </div>
            
            <div class="content">
                <h2>Welcome to DNA Diet Club, ${params.patientName}!</h2>
                
                <p>Your healthcare provider, <strong>${params.providerName}</strong>, has created your account on the DNA Diet Club platform. This powerful health management system will help you track your progress and receive personalized nutrition and exercise plans.</p>
                
                <div class="credentials">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${params.loginEmail}</p>
                    <p><strong>Password:</strong> ${params.password}</p>
                </div>
                
                <p>Click the button below to access your personalized health dashboard:</p>
                
                <a href="${params.appUrl}" class="button">Access DNA Diet Club App</a>
                
                <p>Or copy and paste this link into your browser: <br>
                <a href="${params.appUrl}">${params.appUrl}</a></p>
                
                <h3>What you can do in the app:</h3>
                <ul>
                    <li>📊 Track your health metrics and progress</li>
                    <li>🍽️ Receive personalized meal plans and recipes</li>
                    <li>💪 Get custom exercise routines</li>
                    <li>💊 View supplement recommendations</li>
                    <li>📱 Communicate with your healthcare provider</li>
                    <li>🩺 Monitor glucose levels (with Dexcom integration)</li>
                </ul>
                
                <p><strong>Important:</strong> Please change your password after your first login for security.</p>
                
                <p>If you have any questions or need help accessing your account, please contact your healthcare provider directly.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent by DNA Diet Club on behalf of ${params.providerName}</p>
                <p>© 2025 DNA Diet Club - Personalized Health Management Platform</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const emailText = `
Welcome to DNA Diet Club, ${params.patientName}!

Your healthcare provider, ${params.providerName}, has created your account on the DNA Diet Club platform.

Your Login Credentials:
Email: ${params.loginEmail}
Password: ${params.password}

Access your account here: ${params.appUrl}

What you can do in the app:
- Track your health metrics and progress
- Receive personalized meal plans and recipes
- Get custom exercise routines
- View supplement recommendations
- Communicate with your healthcare provider
- Monitor glucose levels (with Dexcom integration)

Important: Please change your password after your first login for security.

If you have any questions, please contact your healthcare provider directly.

© 2025 DNA Diet Club - Personalized Health Management Platform
    `;

    await mailService.send({
      to: params.patientEmail,
      from: 'noreply@dnadietclub.com', // You'll need to verify this domain in SendGrid
      subject: `Welcome to DNA Diet Club - Your Account is Ready!`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`Welcome email sent successfully to ${params.patientEmail}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPatientNotificationEmail(
  patientEmail: string,
  patientName: string,
  subject: string,
  message: string,
  providerName: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email notification');
    return false;
  }

  try {
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #0ea5e9; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0ea5e9; }
            .content { padding: 20px 0; }
            .message-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🧬 DNA Diet Club</div>
            </div>
            
            <div class="content">
                <h2>Message from ${providerName}</h2>
                <p>Hello ${patientName},</p>
                
                <div class="message-box">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                
                <p>You can view this message and more in your DNA Diet Club app.</p>
            </div>
            
            <div class="footer">
                <p>This message was sent by ${providerName} via DNA Diet Club</p>
                <p>© 2025 DNA Diet Club - Personalized Health Management Platform</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await mailService.send({
      to: patientEmail,
      from: 'noreply@dnadietclub.com',
      subject: `DNA Diet Club - ${subject}`,
      text: `Message from ${providerName}:\n\n${message}\n\n© 2025 DNA Diet Club`,
      html: emailHtml,
    });

    console.log(`Notification email sent successfully to ${patientEmail}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}