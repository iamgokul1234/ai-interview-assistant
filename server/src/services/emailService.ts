import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"AI Interview Assistant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0c29; color: white; padding: 40px; border-radius: 16px;">
        <h2 style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px;">
          AI Interview Assistant
        </h2>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
          You requested a password reset. Click the button below to reset your password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px;">
          This link expires in <strong>1 hour</strong>.
        </p>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px;">
          If you did not request this, please ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.3); font-size: 12px;">
          AI Interview Assistant — Your personal interview preparation platform
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};