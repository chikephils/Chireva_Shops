import { SendLayer } from "sendlayer";

const sendlayer = new SendLayer(process.env.SENDLAYER_API_KEY);

export async function sendMail({ to, subject, html, text }) {
  try {
    const response = await sendlayer.Emails.send({
      from: process.env.SMTP_MAIL,
      to,
      subject,
      html,
      text,
    });

    return response; // { messageId: '...' }
  } catch (error) {
    console.error("SendLayer Error:", error);
    throw error;
  }
}
