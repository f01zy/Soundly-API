import { Request, Response, ErrorRequestHandler } from "express";
import { ApiError } from "../exceptions/api.exception";

export default (err: ApiError, req: Request, res: Response, next: Function) => {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({ ...err })
  }

  return res.status(500).json({ message: "Непредвиденная ошибка" })
}