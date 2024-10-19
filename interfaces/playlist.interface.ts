import { Schema } from "mongoose";

export interface IPlaylist {
  name: string,
  description: string,
  author: Schema.Types.ObjectId
  saving: Array<Schema.Types.ObjectId>
  tracks: Array<Schema.Types.ObjectId>
  type: "playlist"
}