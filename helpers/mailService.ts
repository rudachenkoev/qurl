import { createTransport, Transporter } from 'nodemailer'
import fs from 'fs'
import path from 'path'

const sender = process.env.EMAIL_USER as string
const mailTransporter: Transporter = createTransport({
  service: 'gmail',
  auth: {
    user: sender,
    pass: process.env.EMAIL_PASSWORD as string
  }
})

interface MailParams {
  to: string
  subject?: string
  html?: string
}

interface Replacements {
  [key: string]: string
}

// Sends an email with the specified details using nodemailer.
const sendMail = ({ to, subject = '', html = '' }: MailParams): Promise<object> => {
  const mailDetails = { from: sender, to, subject, html }
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(mailDetails, function (err, info) {
      if (err) reject(err.message)
      else resolve(info)
    })
  })
}

// Replaces placeholders in an HTML string with specified replacement values.
const replacePlaceholders = (html: string, replacements: Replacements): string => {
  let result = html
  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(`{{ ${placeholder} }}`, 'g')
    result = result.replace(regex, replacements[placeholder])
  })
  return result
}

// Sends a verification code email using a pre-defined HTML template with dynamic content.
const sendVerificationCodeMail = async ({ to, subject = '', replacements }: { to: string, subject?: string, replacements: Replacements }): Promise<object> => {
  const mailPath = path.join(__dirname, '..', 'public', 'html', 'VerificationCodeMail.html')
  const mainTemplate = fs.readFileSync(mailPath, 'utf-8')
  return await sendMail({
    to,
    subject,
    html: replacePlaceholders(mainTemplate, replacements)
  })
}

export {
  sendVerificationCodeMail
}
