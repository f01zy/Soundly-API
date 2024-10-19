import { Schema } from "mongoose";

export interface IToken {
  user: Schema.Types.ObjectId;
  refreshToken: string
}