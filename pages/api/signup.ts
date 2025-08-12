import { sendEmail } from '@/utils/email';

await sendEmail(
  'your-admin-email@chrismatt.com',
  'New User Signup - Approval Required',
  `
    <p>A new user has signed up:</p>
    <p>Email: ${user.email}</p>
    <p><a href="https://asset-manager-umber-two.vercel.app/admin/approve?user=${user.id}">Approve this account</a></p>
  `
);
