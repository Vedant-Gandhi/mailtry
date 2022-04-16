const bcrypt = require("bcrypt");
function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function compareHashedPasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
const errorCodes = {
  INVALID_DATA: { code: "INVALID_FORMAT", message: "Invalid data format." },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "A server error has occured.",
  },
  NOT_CREATED:{code:"NOT_CREATED",message:"Failed to create the requested entity."}
};
module.exports = { hashPassword, compareHashedPasswords, errorCodes };
