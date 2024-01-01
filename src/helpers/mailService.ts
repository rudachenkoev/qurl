import { createTransport } from 'nodemailer'
import * as process from 'process'

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
  text?: string
}
export const sendMail = (details: IMailDetails):Promise<any> => {
  const mailDetails = { from: sender, ...details }
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(mailDetails, function (err, info) {
      if (err) reject(err.message)
      else resolve(info)
    })
  })
}

export interface IReplacements {
  [key: string]: string
}
export const replacePlaceholders = (html: string, replacements: IReplacements) => {
  let result = html
  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(`{{ ${placeholder} }}`, 'g')
    result = result.replace(regex, replacements[placeholder])
  })
  return result
}
