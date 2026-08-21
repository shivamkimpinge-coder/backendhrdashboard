const resetPasswordEmail = (resetURL) => {
  const text = `Reset Your Password

Hello,

We received a request to reset your password.

Click the link below to create a new password:

${resetURL}

This password reset link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.
For security reasons, please do not share this link with anyone.

Thanks,
HR Dashboard Team`;

  const html = `
  <div style="background:#0b1220;padding:32px 16px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#0f172a;border:1px solid rgba(125,211,252,0.16);border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 20px;color:#f6f7fb;font-size:22px;">Reset Your Password</h1>
          <p style="margin:0 0 12px;color:#cbd5e1;font-size:15px;line-height:1.6;">Hello,</p>
          <p style="margin:0 0 20px;color:#cbd5e1;font-size:15px;line-height:1.6;">
            We received a request to reset your password.
          </p>
          <p style="margin:0 0 24px;color:#cbd5e1;font-size:15px;line-height:1.6;">
            Click the button below to create a new password:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-radius:10px;background:linear-gradient(135deg,#38bdf8,#2563eb);">
                <a href="${resetURL}" target="_blank"
                  style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
            This password reset link will expire in 15 minutes.
          </p>
          <p style="margin:12px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
          <p style="margin:12px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
            For security reasons, please do not share this link with anyone.
          </p>
          <p style="margin:28px 0 0;color:#cbd5e1;font-size:15px;">
            Thanks,<br />HR Dashboard Team
          </p>
        </td>
      </tr>
    </table>
  </div>`;

  return { text, html };
};

module.exports = { resetPasswordEmail };
