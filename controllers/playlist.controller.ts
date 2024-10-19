import { Request, Response } from "express";
import { PlaylistService } from "../service/playlist.service";
import { ApiError } from "../exceptions/api.exception";
import { Types } from "mongoose";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { playlistModel } from "../models/playlist.model";
import { setDataToRedis } from "../utils/setDataToRedis.utils";
import { checkValidation } from '../utils/checkValidation.utils';

const playlistService = new PlaylistService()

export class PlaylistController {
  public async create(req: Request, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const { name, description, tracks } = req.body
      const { refreshToken } = req.cookies

      const playlist = await playlistService.create(refreshToken, name, description, tracks)

      return res.json(await playlistService.populate(playlist))
    } catch (e) {
      next(e)
    }
  }

  public async getOne(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params
      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      // const redisData = await getDataFromRedis(id)
      // if (redisData) return res.json(redisData)

      let playlist = await playlistModel.findById(id)
      if (!playlist) throw ApiError.NotFound()
      playlist = await playlistService.populate(playlist) as any

      // await setDataToRedis(id, playlist)
      return res.json(playlist)
    } catch (e) {
      next(e)
    }
  }

  public async save(req: Request, res: Response, next: Function) {
    try {
      checkValidation(req, next)

      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const playlist = await playlistService.save(refreshToken, id)

      return res.json(await playlistService.populate(playlist))
    } catch (e) {
      next(e)
    }
  }
}