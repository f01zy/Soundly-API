import { Schema, model } from "mongoose";
import { IMusic } from "../interfaces/music.interface";

const MusicSchema = new Schema<IMusic>({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  listenings: [{ type: Schema.Types.ObjectId, ref: "Listening", default: [] }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  type: { type: String, default: "track" }
})

export const musicModel = model("Music", MusicSchema)