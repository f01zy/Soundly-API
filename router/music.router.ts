import { Router } from "express"
import { body } from "express-validator"
import { MusicController } from "../controllers/music.controller"

const musicController = new MusicController()

export const musicRouter = Router()

musicRouter.get("/:id", musicController.getOneMusic)
musicRouter.delete("/:id", musicController.delete)
musicRouter.post("/listen", body("id").isString(), musicController.listen)
musicRouter.post("/like", body("id").isString(), musicController.like)
musicRouter.post("/", body("name").isString().isLength({ max: 50 }), musicController.create)
musicRouter.get("/", musicController.getAllMusic)