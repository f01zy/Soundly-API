import { Schema, model } from "mongoose";
import { IListening } from "../interfaces/listening.interface";

const ListeningSchema = new Schema<IListening>({
  date: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }
})

export const listeningModel = model("Listening", ListeningSchema)