// Email service for k-H platform
// Using simple fetch to email service API

interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

const FROM_EMAIL = 'noreply@k-h.com'
const FROM_NAME = 'k-H Platform'

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    console.log('📧 Sending email to:', to, 'Subject:', subject)
    
    // For now, we'll use a simple email service
    // You can replace this with Resend, SendGrid, or any email service
    
    // Mock email sending for development
    console.log('✅ Email would be sent:', {
      to,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      subject,
      html: html.substring(0, 100) + '...'
    })
    
    // In production, replace with real email service:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html
      })
    })
    
    if (!response.ok) {
      throw new Error('Email service error')
    }
    */
    
    return { success: true, message: 'Email sent successfully' }
    
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return { success: false, message: 'Failed to send email' }
  }
}

export function generateVerificationEmail(verificationCode: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your k-H Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to k-H!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nigeria's Premier Student Housing Platform</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
        <p>Thank you for joining k-H. To complete your registration and start using our platform, please verify your email address.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #007bff; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${verificationCode}
          </div>
        </div>
        
        <p style="text-align: center; color: #666; font-size: 14px;">
          Enter this code on the verification page to activate your account.<br>
          This code expires in 15 minutes for security.
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>If you didn't create an account with k-H, please ignore this email.</p>
        <p>© 2025 k-H Platform. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export function generatePasswordResetEmail(resetCode: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your k-H Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">k-H Platform Security</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
        <p>We received a request to reset your k-H account password. Use the code below to create a new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #dc3545; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${resetCode}
          </div>
        </div>
        
        <p style="text-align: center; color: #666; font-size: 14px;">
          Enter this code on the password reset page to create a new password.<br>
          This code expires in 15 minutes for security.
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
        <p>© 2025 k-H Platform. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export function generateWelcomeEmail(userName: string, userRole: string) {
  const isAgent = userRole === 'agent'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to k-H Platform!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to k-H!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your account is now active</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
        <p>Welcome to k-H, Nigeria's premier student housing platform! Your account has been successfully verified and activated.</p>
        
        ${isAgent ? `
          <h3 style="color: #007bff;">As an Agent, you can now:</h3>
          <ul style="color: #666;">
            <li>List your hostel properties with photos and videos</li>
            <li>Manage booking requests from students</li>
            <li>Build your reputation with student ratings</li>
            <li>Access your agent dashboard for analytics</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://k-hostel.vercel.app/dashboard" style="background: #007bff; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; display: inline-block;">
              Go to Agent Dashboard
            </a>
          </div>
        ` : `
          <h3 style="color: #28a745;">As a Student, you can now:</h3>
          <ul style="color: #666;">
            <li>Browse verified hostel listings near your university</li>
            <li>Book instant inspections with trusted agents</li>
            <li>Rate and review agents to help other students</li>
            <li>Track your booking requests and status</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://k-hostel.vercel.app/hostels" style="background: #28a745; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; display: inline-block;">
              Browse Hostels
            </a>
          </div>
        `}
        
        <p style="color: #666; margin-top: 25px;">
          If you have any questions or need support, feel free to contact us at support@k-h.com
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>Thank you for choosing k-H for your accommodation needs!</p>
        <p>© 2025 k-H Platform. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}