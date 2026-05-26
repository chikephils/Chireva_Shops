const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,

      port: Number(process.env.SMTP_PORT),

      secure: false,

      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },

      tls: {
        rejectUnauthorized: false,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    await transporter.verify();

    console.log("SMTP CONNECTED");

    const info = await transporter.sendMail({
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });
    console.log("FULL MAIL INFO:", info);
    console.log("MAIL SENT:", info.messageId);

    return info;
  } catch (error) {
    console.log("MAIL ERROR:", error);

    throw error;
  }
};

module.exports = sendMail;
