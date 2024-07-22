import { createTransport } from 'nodemailer'
import * as process from 'process'
import fs from 'fs'
import path from 'path'

const sender = process.env.EMAIL_USER
const mailTransporter = createTransport({
  service: 'gmail',
  auth: {
    user: sender,
    pass: process.env.EMAIL_PASSWORD
  }
})

interface IMailDetails {
  to: string,
  subject?: string,
  text?: string,
  html?: string
}
const sendMail = (details: IMailDetails):Promise<any> => {
  const mailDetails = { from: sender, ...details }
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(mailDetails, function (err, info) {
      if (err) reject(err.message)
      else resolve(info)
    })
  })
}

interface IReplacements {
  [key: string]: string
}
const replacePlaceholders = (html: string, replacements: IReplacements) => {
  let result = html
  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(`{{ ${placeholder} }}`, 'g')
    result = result.replace(regex, replacements[placeholder])
  })
  return result
}

export const sendVerificationCodeMail = async ({ to, subject = '', replacements }: { to: string, subject: string, replacements: IReplacements }) => {
  const mailPath = path.join(__dirname, '..', 'public', 'html', 'VerificationCodeMail.html')
  const mainTemplate = fs.readFileSync(mailPath, 'utf-8')
  return await sendMail({
    to,
    subject,
    html: replacePlaceholders(mainTemplate, replacements)
  })
}
