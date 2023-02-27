const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY, PORT, EMAIL_SENDER } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (email, verificationToken) => {
  const msg = {
    to: email,
    from: EMAIL_SENDER, // Use the email address or domain you verified above
    subject: "Thanks for your registration",
    text: "Welcome to our service",
    html: `<a target="_blank" href="http://localhost:${PORT}/api/users/verify/${verificationToken}">Нажмите для подтверждения email</a>`,
  };
  await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = sendEmail;
