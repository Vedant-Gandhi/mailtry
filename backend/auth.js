const { Auth, LoginCredentials } = require("two-step-auth");
require("dotenv-flow").config();

LoginCredentials.mailID = "vedantgandhipersonal@gmail.com";

LoginCredentials.password = process.env.MAIL_PASSWORD;

LoginCredentials.use = false;

console.log(LoginCredentials.mailID);
console.log(LoginCredentials.password);
console.log(LoginCredentials.use);

async function sendEmail(emailId) {
  try {
    const res = await Auth(emailId);
    return Promise.resolve({
      email: res.mail,
      otp: res.OTP,
      isSuccess: res.success,
    });
  } catch (error) {
   // console.log([...error]);
    throw error;
  }
}

module.exports = { sendEmail };
