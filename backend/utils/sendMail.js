const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendlayer.net",
      port: 587,
      secure: false,

      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },

      requireTLS: true,

      tls: {
        rejectUnauthorized: false,
      },

      family: 4,

      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });

    await transporter.verify();

    console.log("SMTP CONNECTED");

    const info = await transporter.sendMail({
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log("MAIL SENT:", info);

    return info;
  } catch (error) {
    console.log("MAIL ERROR:", error);

    throw error;
  }
};

module.exports = sendMail;
