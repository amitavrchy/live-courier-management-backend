export type CredentialsEmailParams = {
  fullName: string;
  email: string;
  password: string;
  loginUrl: string;
  companyName?: string;
};

export function buildCredentialsEmailHtml(
  params: CredentialsEmailParams,
): string {
  const brand = params.companyName ?? 'AndYesQo';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brand} account credentials</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#0f766e;padding:24px 28px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${brand}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#ccfbf1;">Your account is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:16px;">Hi ${params.fullName},</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4b5563;">
                An administrator created your ${brand} account. Use the login credentials below to sign in.
                Please change your password after your first login.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">Email</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:700;">${params.email}</p>
                    <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">Temporary password</p>
                    <p style="margin:0;font-size:15px;font-weight:700;letter-spacing:0.3px;">${params.password}</p>
                  </td>
                </tr>
              </table>

              <a href="${params.loginUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 18px;border-radius:8px;">
                Open login page
              </a>

              <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">
                If the button does not work, copy this URL into your browser:<br />
                <span style="color:#0f766e;">${params.loginUrl}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCredentialsEmailText(
  params: CredentialsEmailParams,
): string {
  const brand = params.companyName ?? 'AndYesQo';
  return [
    `Hi ${params.fullName},`,
    '',
    `Your ${brand} account has been created.`,
    '',
    `Email: ${params.email}`,
    `Temporary password: ${params.password}`,
    `Login: ${params.loginUrl}`,
    '',
    'Please change your password after your first login.',
  ].join('\n');
}
