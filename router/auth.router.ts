import { Router } from "express"
import { body } from "express-validator"
import { UserController } from "../controllers/user.controller"

const userController = new UserController()

export const authRouter = Router()

authRouter.post("/register",
  body("username").isString().isLength({ min: 4, max: 16 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8, max: 30 }),
  userController.register
)
authRouter.post("/login",
  body("email").isEmail(),
  body("password").isString(),
  userController.login
)
authRouter.get("/logout", userController.logout)
authRouter.post("/activate/resend", userController.resend)
authRouter.get("/activate/:link", userController.activate)
authRouter.get("/refresh", userController.refresh)