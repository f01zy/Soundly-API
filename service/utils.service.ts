import mongoose from "mongoose";
import { db } from "..";

export class UtilsService {
  public async statistics() {
    const statistics = await db.db.stats()

    return statistics
  }
}