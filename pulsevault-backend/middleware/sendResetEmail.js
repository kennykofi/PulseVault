const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"PulseVault Support" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: "🔐 Password Reset Request",
    html: `
      <h3>Reset Your PulseVault Password</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p><strong>This link will expire in 1 hour.</strong></p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendResetEmail;
