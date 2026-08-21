const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, message, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: message,
    ...(html ? { html } : {}),
  });
};

module.exports = sendEmail;