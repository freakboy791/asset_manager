import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email via Resend using the verified sending domain.
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body of the email
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }
  if (!process.env.FROM_EMAIL) {
    throw new Error('FROM_EMAIL is not set');
  }

  try {
    const response = await resend.emails.send({
      from: `Asset Manager <${process.env.FROM_EMAIL}>`, // e.g. noreply@chrismatt.com
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
