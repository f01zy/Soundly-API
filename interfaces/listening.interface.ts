import { Schema } from "mongoose";

export interface IListening {
  date: Date,
  user: Schema.Types.ObjectId
}