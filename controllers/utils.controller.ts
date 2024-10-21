import { Request, Response } from "express";
import { UtilsService } from "../service/utils.service";
import { TokenService } from "../service/token.service";
import { ApiError } from "../exceptions/api.exception";

const utilsService = new UtilsService()
const tokenService = new TokenService()

export class UtilsController {
  public async statistics(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const user = await tokenService.getUserByRefreshToken(refreshToken)

      if (!user.isStaff) throw ApiError.BadRequest("Access is denied")

      const statistics = await utilsService.statistics()

      return res.json(statistics)
    } catch (e) {
      next(e)
    }
  }
}