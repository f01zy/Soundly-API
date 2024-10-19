import { Schema, model } from "mongoose";
import { IToken } from "../interfaces/token.interface";

const TokenSchema = new Schema<IToken>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  refreshToken: { type: String, required: true },
})

export const tokenModel = model("Token", TokenSchema)