import { Router } from "express"
import { body } from "express-validator"
import { PlaylistController } from "../controllers/playlist.controller"

const playlistController = new PlaylistController()

export const playlistRouter = Router()

playlistRouter.post("/",
  body("name").isString().isLength({ max: 50 }),
  body("description").isString().isLength({ max: 200 }),
  body("tracks").isArray(),
  playlistController.create
)
playlistRouter.get("/:id", playlistController.getOne)
playlistRouter.post("/save", body("id").isString(), playlistController.save)