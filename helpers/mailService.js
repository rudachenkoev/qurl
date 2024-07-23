const { createTransport } = require('nodemailer')
const fs = require('fs')
const path = require('path')

const sender = process.env.EMAIL_USER
const mailTransporter = createTransport({
  service: 'gmail',
  auth: {
    user: sender,
    pass: process.env.EMAIL_PASSWORD
  }
})

/**
 * Sends an email with the specified details using nodemailer.
 * @param {Object} params - The email details.
 * @param {string} params.to - The recipient's email address.
 * @param {string} [params.subject=''] - The subject of the email.
 * @param {string} [params.html=''] - The HTML content of the email.
 * @returns {Promise<Object>} A promise that resolves with the response information if the email is sent successfully, or rejects with an error message if sending fails.
 */
const sendMail = ({ to, subject, html }) => {
  const mailDetails = { from: sender, to, subject, html }
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(mailDetails, function (err, info) {
      if (err) reject(err.message)
      else resolve(info)
    })
  })
}

/**
 * Replaces placeholders in an HTML string with specified replacement values.
 * @param {string} html - The HTML content with placeholders.
 * @param {Object} replacements - An object where keys are placeholder names and values are the replacement text.
 * @returns {string} The HTML content with placeholders replaced by their corresponding values.
 */
const replacePlaceholders = (html, replacements) => {
  let result = html
  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(`{{ ${placeholder} }}`, 'g')
    result = result.replace(regex, replacements[placeholder])
  })
  return result
}

/**
 * Sends a verification code email using a pre-defined HTML template with dynamic content.
 * @param {Object} params - The email details.
 * @param {string} params.to - The recipient's email address.
 * @param {string} [params.subject=''] - The subject of the email.
 * @param {Object} params.replacements - An object where keys are placeholder names and values are the replacement text for the email template.
 * @returns {Promise<Object>} A promise that resolves with the email response information if sent successfully, or rejects with an error if sending fails.
 */
const sendVerificationCodeMail = async ({ to, subject = '', replacements }) => {
  const mailPath = path.join(__dirname, '..', 'public', 'html', 'VerificationCodeMail.html')
  const mainTemplate = fs.readFileSync(mailPath, 'utf-8')
  return await sendMail({
    to,
    subject,
    html: replacePlaceholders(mainTemplate, replacements)
  })
}

module.exports = {
  sendVerificationCodeMail
}
