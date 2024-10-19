import { Router } from "express"
import { UtilsController } from "../controllers/utils.controller"

const utilsController = new UtilsController()

export const utilsRouter = Router()

utilsRouter.get("/statistics", utilsController.statistics)