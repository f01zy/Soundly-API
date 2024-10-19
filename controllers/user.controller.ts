import { ApiError } from "../exceptions/api.exception"
import { UserService } from "../service/user.service"
import { Request, Response } from "express"
import { Types } from "mongoose";
import { Variables } from "../env/variables.env";
import { userModel } from "../models/user.model";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { setDataToRedis } from "../utils/setDataToRedis.utils";
import { checkValidation } from "../utils/checkValidation.utils";
import { TokenService } from "../service/token.service";
import crypto from "crypto"
import { MailService } from "../service/mail.service";

interface IAuthRequestBody {
  username: string;
  email: string;
  password: string;
}

const userService = new UserService()
const tokenService = new TokenService()
const mailService = new MailService()

export class UserController {
  public async register(req: Request<{}, {}, IAuthRequestBody>, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const isAdminPassword = req.query.ap as string
      let isAdmin = false

      if (isAdminPassword === Variables.ADMIN_CREATE_PASSWORD) isAdmin = true

      const { username, email, password } = req.body
      const userData = await userService.register(username, email, password, isAdmin)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: Variables.MODE == "development" ? false : false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async login(req: Request<{}, {}, Omit<IAuthRequestBody, "username">>, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const { email, password } = req.body

      const userData = await userService.login(email, password)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: Variables.MODE == "development" ? false : false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async logout(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie("refreshToken")
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  public async activate(req: Request, res: Response, next: Function) {
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)

      return res.redirect(Variables.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }

  public async resend(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const user = await tokenService.getUserByRefreshToken(refreshToken)
      const activationLink = user.activationLink

      await mailService.sendActivationMail(user.email, Variables.SERVER_URL + "/api/auth/activate/" + activationLink)

      return res.json({ status: "status" })
    } catch (e) {
      next(e)
    }
  }

  public async refresh(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: Variables.MODE == "development" ? false : false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async getUserById(req: Request<{ id: string }, {}, {}>, res: Response, next: Function) {
    try {
      const { id } = req.params
      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      // const redisData = await getDataFromRedis(id)
      // if (redisData) return res.json(redisData)

      let user = await userModel.findById(id)
      if (!user) throw ApiError.NotFound()
      user = await userService.populate(user) as any

      // await setDataToRedis(id, user)
      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async put(req: Request, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const files = req.files
      const { refreshToken } = req.cookies
      const body = req.body

      const user = await userService.put(files, body, refreshToken)

      return res.json(await userService.populate(user))
    } catch (e) {
      next(e)
    }
  }

  public async getUsers(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies

      const user = await tokenService.getUserByRefreshToken(refreshToken)
      if (!user.isAdmin) throw ApiError.BadRequest("Access is denied")

      const users = await userModel.find()
      let usersPopulate = []

      for (let i = 0; i < users.length; i++) {
        const el = users[i]

        usersPopulate.push(await userService.populate(el))
      }

      return res.json(usersPopulate)
    } catch (e) {
      next(e)
    }
  }

  public async delete(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params
      const { refreshToken } = req.cookies

      await userService.delete(id, refreshToken)

      return res.json(id)
    } catch (e) {
      next(e)
    }
  }
}