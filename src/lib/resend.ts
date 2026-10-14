import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function resetResendClient(): void {
  resendInstance = null;
}

export function getResendClient(): Resend {
  if (resendInstance) {
    return resendInstance;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable.');
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export interface SendAssignmentEmailParams {
  toEmail: string;
  recipientName: string;
  eventTitle: string;
  budgetAmount?: number | null;
  budgetCurrency?: string;
  exchangeDate?: string | null;
  revealUrl: string;
}

export async function sendAssignmentEmail(params: SendAssignmentEmailParams) {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Secret Santa <onboarding@resend.dev>';

  const subject = `🎁 Your Secret Santa assignment for ${params.eventTitle}!`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; margin: 0; padding: 24px; color: #171717; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 15px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { color: #0d2818; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
          .subtitle { color: #6b7280; font-size: 15px; margin: 0; }
          .card { background: #fdf2f4; border: 1px solid #fecdd3; border-radius: 15px; padding: 20px; margin: 24px 0; text-align: center; }
          .badge { display: inline-block; background: #2d6a4f; color: white; border-radius: 15px; padding: 6px 14px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
          .btn { display: inline-block; background-color: #d90429; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 28px; border-radius: 15px; text-align: center; box-shadow: 0 4px 10px rgba(217, 4, 41, 0.25); }
          .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎄 Secret Santa Assignment</h1>
            <p class="subtitle">You have been invited to participate in <strong>${params.eventTitle}</strong>!</p>
          </div>
          <div class="card">
            <div class="badge">Budget: ${params.budgetAmount ? `${params.budgetAmount} ${params.budgetCurrency || 'USD'}` : 'No limit'}</div>
            ${params.exchangeDate ? `<p style="margin: 6px 0; color: #4b5563; font-size: 14px;">📅 Exchange Date: <strong>${new Date(params.exchangeDate).toLocaleDateString()}</strong></p>` : ''}
            <p style="margin: 16px 0 24px 0; color: #374151; font-size: 15px;">
              Hello <strong>${params.recipientName}</strong>, your Secret Santa match has been drawn! Click the button below to unwrap your secret match.
            </p>
            <a href="${params.revealUrl}" class="btn" target="_blank">🎁 Reveal My Secret Match</a>
          </div>
          <div class="footer">
            <p>Please keep this link secret. Do not share your reveal URL with other participants!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await resend.emails.send({
    from: fromEmail,
    to: params.toEmail,
    subject,
    html: htmlContent,
  });
}
