import { Schema, model } from "mongoose";
import { IPlaylist } from "../interfaces/playlist.interface";

const PlaylistSchema = new Schema<IPlaylist>({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  saving: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  tracks: [{ type: Schema.Types.ObjectId, ref: "Music", default: [] }],
  type: { type: String, default: "playlist" }
})

export const playlistModel = model("Playlist", PlaylistSchema)