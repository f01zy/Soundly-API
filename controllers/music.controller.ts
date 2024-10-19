import { Request, Response } from "express";
import { ApiError } from "../exceptions/api.exception";
import { MusicService } from "../service/music.service";
import { UploadedFile } from "express-fileupload"
import { musicModel } from "../models/music.model";
import { TokenService } from "../service/token.service";
import { Types } from "mongoose";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { setDataToRedis } from "../utils/setDataToRedis.utils";
import { checkValidation } from '../utils/checkValidation.utils';
import { UserService } from "../service/user.service";

const musicService = new MusicService()
const tokenService = new TokenService()
const userService = new UserService()

export class MusicController {
  public async create(req: Request<{}, {}, { name: string }>, res: Response, next: Function) {
    try {
      if (!req.files || Object.keys(req.files).length === 0) return next(ApiError.BadRequest("Файлы не были переданы"))

      checkValidation(req, next)

      const { files } = req.files
      const { name } = req.body

      const { refreshToken } = req.cookies

      const user = await musicService.create(files as UploadedFile[], name, refreshToken)

      return res.json(await userService.populate(user))
    } catch (e) {
      next(e)
    }
  }

  public async getOneMusic(req: Request<{ id: string }, {}, {}>, res: Response, next: Function) {
    try {
      const { id } = req.params
      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      // const redisMusic = await getDataFromRedis(id)
      // if (redisMusic) return res.json(redisMusic)

      let music = await musicModel.findById(id)
      if (!music) throw ApiError.NotFound()
      music = await musicService.populate(music) as any

      // await setDataToRedis(id, music)
      return res.json(music)
    } catch (e) {
      next(e)
    }
  }

  public async getAllMusic(req: Request, res: Response, next: Function) {
    try {
      return res.json(await musicService.getAllMusic())
    } catch (e) {
      next(e)
    }
  }

  public async listen(req: Request<{}, {}, { id: string }>, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const user = await musicService.listen(refreshToken, id as any)

      return res.json(await userService.populate(user))
    } catch (e) {
      next(e)
    }
  }

  public async like(req: Request<{}, {}, { id: string }>, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const user = await tokenService.getUserByRefreshToken(refreshToken)
      const music = await musicModel.findById(id)

      if (!music) {
        throw ApiError.BadRequest("There is no song with this id")
      }

      user.likes.indexOf(music.id) != -1 ? user.likes = user.likes.filter(musicS => musicS != music.id) : user.likes.push(music.id)
      user.save()
      music.likes.indexOf(user.id) != -1 ? music.likes = music.likes.filter(userS => userS != user.id) : music.likes.push(user.id)
      music.save()

      return res.json(await musicService.populate(music))
    } catch (e) {
      next(e)
    }
  }

  public async delete(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const { id } = req.params
      const user = await tokenService.getUserByRefreshToken(refreshToken)

      if (!user.isAdmin) throw ApiError.BadRequest("Access is denied")
      if (!Types.ObjectId.isValid(id)) throw ApiError.BadRequest("Music not found")

      await musicService.delete(id)

      return res.json(id)
    } catch (e) {
      next(e)
    }
  }
}