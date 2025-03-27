const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"PulseVault" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your One-Time Password (OTP) for PulseVault",
    html: `
      <h2>Hello! 👋</h2>
      <p>Your OTP is:</p>
      <h3 style="color: #e53935">${otp}</h3>
      <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
      <br />
      <p>Stay secure,</p>
      <strong>PulseVault Team</strong>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
