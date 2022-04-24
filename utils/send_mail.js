"use strict"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config("./.env")
let user = process.env.EMAIL_ACCOUNT
let pass = process.env.EMAIL_PASSWARD
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user, // generated ethereal user
    pass, // generated ethereal password
  },
})
export async function sendEmail(subject, content) {
  await transporter.sendMail({
    from: `${user}@qq.com`, // sender address
    to: [`${user}@qq.com`], // list of receivers
    subject, // Subject line
    html: content
  })
}
