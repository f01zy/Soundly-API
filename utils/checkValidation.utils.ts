import { Request } from "express";
import { ApiError } from "../exceptions/api.exception";
import { validationResult } from "express-validator";

export const checkValidation = async (req: Request, next: Function) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
  }
}