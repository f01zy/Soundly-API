import { Router } from "express"
import { SearchController } from "../controllers/search.controller"

const searchController = new SearchController()

export const searchRouter = Router()

searchRouter.get("/", searchController.search)