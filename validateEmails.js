/**
 * Validates an email address using a regular expression.
 * @param {string} email - The email address to validate.
 * @return {boolean} - Returns true if the email is valid, otherwise false.
 */
validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

module.exports = validateEmail;
