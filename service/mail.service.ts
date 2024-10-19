import { Variables } from "../env/variables.env"
import nodemailer from "nodemailer"
import { ApiError } from "../exceptions/api.exception"

export class MailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: Variables.SMTP_HOST,
      port: Variables.SMTP_PORT,
      secure: false,
      auth: {
        user: Variables.SMTP_USERNAME,
        pass: Variables.SMTP_PASSWORD
      }
    } as nodemailer.TransportOptions)
  }

  public async sendActivationMail(to: string, link: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: `Активация аккаунта на ${Variables.CLIENT_URL}`,
        text: "",
        html:
          `
          <div>
            <h1>Для активации аккаунта перейдите по ссылке</h1>
            <a href=${link}>Активировать</p>
          </div>
          `
      })
    } catch (err) {
      throw ApiError.BadRequest("Cannot send email")
    }
  }
}