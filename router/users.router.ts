import { Router } from "express"
import { body } from "express-validator"
import { UserController } from "../controllers/user.controller"

const userController = new UserController()

export const usersRouter = Router()

usersRouter.get("/", userController.getUsers)
usersRouter.put("/",
  body("username").isString().optional().isLength({ min: 4, max: 16 }),
  body("description").isString().optional().isLength({ max: 200 }),
  body("links").isArray().optional().custom((value) => { if (value) { return value.every((link: any) => typeof link === 'string') } return true }),
  userController.put
)
usersRouter.get("/:id", userController.getUserById)
usersRouter.delete("/:id", userController.delete)
usersRouter.post("/:id/subscribe", userController.subscribe)