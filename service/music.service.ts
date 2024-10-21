import { UploadedFile } from "express-fileupload"
import { ApiError } from "../exceptions/api.exception"
import { TokenService } from "./token.service"
import { userModel } from "../models/user.model"
import { musicModel } from "../models/music.model"
import path from "path"
import fs from "fs"
import { Document, Schema } from "mongoose"
import { IMusic } from "../interfaces/music.interface"
import { listeningModel } from "../models/listening.model"
import { setDataToRedis } from "../utils/setDataToRedis.utils"
import { getDataFromRedis } from "../utils/getDataFromRedis.utils"

const tokenService = new TokenService()

export class MusicService {
  private async validateFiles(files: UploadedFile[]) {
    if (!files || files.length < 2) {
      throw ApiError.BadRequest("Insufficiently loaded files");
    }

    const imageMIMEtypes = ['image/jpeg', 'image/png'];
    const audioMIMEtypes = ['audio/mpeg'];

    if (!imageMIMEtypes.includes(files[0].mimetype)) {
      throw ApiError.BadRequest("files[0] must be an image")
    }

    if (!audioMIMEtypes.includes(files[1].mimetype)) {
      throw ApiError.BadRequest("files[1] must be an audio")
    }
  }

  public async create(files: UploadedFile[], name: string, refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)

    if (!user.isActivated) throw ApiError.BadRequest("Confirm email")

    const musicSearch = await musicModel.findOne({ name })
    if (musicSearch) throw ApiError.BadRequest("Track already exists")

    const musicCreated = await musicModel.create({ author: user._id, name, date: new Date() })

    this.validateFiles(files)
    files[0].mv(path.join('static', "cover", `${musicCreated._id}.jpg`))
    files[1].mv(path.join('static', "music", `${musicCreated._id}.mp3`))

    user.tracks.push(musicCreated.id)
    user.save()

    return user
  }

  public async listen(refreshToken: string, musicId: Schema.Types.ObjectId) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const music = await musicModel.findById(musicId)

    if (!music) {
      throw ApiError.BadRequest("There is no song with this id")
    }

    const listening = await listeningModel.create({ date: new Date(), user: user._id })

    music.listenings.push(listening.id)
    music.save()

    const history = user.history.filter(historyMusic => historyMusic != musicId)
    history.unshift(musicId)
    const newUser = await userModel.findOneAndUpdate(
      { _id: user._id, __v: user.__v },
      { $set: { history } },
      { new: true, runValidators: true }
    )

    if (!newUser) {
      throw ApiError.BadRequest("Error query")
    }

    return newUser
  }

  public async getAllMusic() {
    // const redisMusic = await getDataFromRedis("music")
    // if (redisMusic) return redisMusic

    const music = await musicModel.find()
    const musicPopulate: Array<Document<unknown, {}, IMusic>> = []

    for (const musicOnePopulate of music) {
      musicPopulate.push(await this.populate(musicOnePopulate))
    }

    // await setDataToRedis("music", musicPopulate)
    return musicPopulate as any as IMusic[]
  }

  public async delete(id: string) {
    const music = await musicModel.findById(id)

    if (!music) throw ApiError.BadRequest("Music not found")

    for (let i = 0; i < music.listenings.length; i++) {
      await listeningModel.findByIdAndDelete(music.listenings[i])
    }

    const ends = { "music": ".mp3", "cover": ".jpg" };
    ["music", "cover"].map(str => fs.unlink(path.join("static", str, `${music._id}${(ends as any)[str]}`), () => { }))

    await music.deleteOne()
  }

  public async populate(music: Document<unknown, {}, IMusic> & IMusic) {
    return await music.populate([
      { path: "author" },
      { path: "listenings", populate: "user" }
    ])
  }
}