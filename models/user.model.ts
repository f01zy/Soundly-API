import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const UserSchema = new Schema<IUser>({
  isAdmin: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String, required: true },
  avatar: { type: Boolean, default: false },
  banner: { type: Boolean, default: false },
  description: { type: String, default: "" },
  links: [{ type: String, default: "" }],
  playlists: [{ type: String, default: [], ref: "Playlist" }],
  likes: [{ type: String, default: [], ref: "Music" }],
  tracks: [{ type: String, default: [], ref: "Music" }],
  history: [{ type: String, default: [], ref: "Music" }]
})

export const userModel = model("User", UserSchema)