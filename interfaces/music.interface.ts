import { Schema } from "mongoose";

export interface IMusic {
  author: Schema.Types.ObjectId,
  name: string,
  date: Date,
  listenings: Array<Schema.Types.ObjectId>,
  likes: Array<Schema.Types.ObjectId>,
  type: "track"
}