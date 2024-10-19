import jwt from "jsonwebtoken"
import { tokenModel } from "../models/token.model"
import { Variables } from "../env/variables.env"
import { ApiError } from "../exceptions/api.exception"
import { userModel } from "../models/user.model"

export class TokenService {
  public async validateRefresh(token: string) {
    try {
      const userToken = jwt.verify(token, Variables.JWT_REFRESH_SECRET) as { id: string }
      const user = await userModel.findById(userToken.id)

      return user
    } catch (e) {
      return null
    }
  }

  public async generateTokens(id: string) {
    const accessToken = jwt.sign({ id }, Variables.JWT_ACCESS_SECRET, { expiresIn: "30m" })
    const refreshToken = jwt.sign({ id }, Variables.JWT_REFRESH_SECRET, { expiresIn: "30d" })

    return {
      accessToken,
      refreshToken
    }
  }

  public async saveToken(userId: string, refreshToken: string) {
    const token = await tokenModel.findOne({ user: userId })

    if (token) {
      token.refreshToken = refreshToken

      return token.save()
    }

    const tokenCreated = await tokenModel.create({ user: userId, refreshToken })

    return tokenCreated
  }

  public async removeToken(refreshToken: string) {
    const token = await tokenModel.deleteOne({ refreshToken })
    return token
  }

  public async findToken(refreshToken: string) {
    const token = await tokenModel.findOne({ refreshToken })
    return token
  }

  public async getUserByRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = await this.validateRefresh(refreshToken)
    const tokenDb = await this.findToken(refreshToken)

    if (!tokenDb || !userData) {
      throw ApiError.UnauthorizedError()
    }

    const user = await userModel.findById(userData._id)

    if (!user) {
      throw ApiError.BadRequest("Invalid token")
    }

    return user
  }
}