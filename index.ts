import dotenv from "dotenv"
dotenv.config()

import errorMiddleware from "./middlewares/error.middleware"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import http from "http"
import mongoose from "mongoose"
import { Variables } from "./env/variables.env"
import path from "path"
import fileUpload from "express-fileupload"
import { createClient } from "redis"
import { authRouter } from "./router/auth.router"
import { musicRouter } from "./router/music.router"
import { playlistRouter } from "./router/playlist.router"
import { searchRouter } from "./router/search.router"
import { usersRouter } from "./router/users.router"
import { utilsRouter } from "./router/utils.router"
import { MailService } from "./service/mail.service"
import fs from "fs"

export const app = express()
// export const client = createClient({ url: `redis://:pass@localhost:6379` }).on("error", error => console.log(error))

app.use(cors({ credentials: true, origin: Variables.CLIENT_URL }))
app.use(fileUpload())
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "static")))
app.use("/api/auth", authRouter)
app.use("/api/music", musicRouter)
app.use("/api/playlist", playlistRouter)
app.use("/api/search", searchRouter)
app.use("/api/users", usersRouter)
app.use("/api/utils", utilsRouter)
app.use(errorMiddleware)

const mailService = new MailService()
const server = http.createServer(app)
const PORT = Variables.PORT

const start = async () => {
  try {
    // await client.connect()
    await mongoose.connect(Variables.DATABASE_URL)

    server.listen(PORT, async () => {
      fs.mkdir(path.join(__dirname, "static"), (err) => {
        [
          "avatar",
          "banner",
          "cover",
          "music"
        ].map(item => fs.mkdir(path.join(__dirname, "static", item), () => { }))
      })
      console.log(`[INFO] server started in ${Variables.MODE} mode`);
    })
  } catch (e) {
    throw new Error(e as string)
  }
}

start()

export const db = mongoose.connection