import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@habittracker.com',
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log('Email sent: ', info.messageId);
};

export default sendEmail;
