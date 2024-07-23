require('dotenv').config()
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

const sendMail = details => {
  const mailDetails = { from: sender, ...details }
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(mailDetails, function (err, info) {
      if (err) reject(err.message)
      else resolve(info)
    })
  })
}

const replacePlaceholders = (html, replacements) => {
  let result = html
  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(`{{ ${placeholder} }}`, 'g')
    result = result.replace(regex, replacements[placeholder])
  })
  return result
}

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
