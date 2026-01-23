import {MyError} from "#src/gears/error/model.js";
import {Request} from "express";
import {validationResult} from "express-validator";

let validateReqSchema = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw new MyError({
      statusCode: 400,
      message: "Request schema validation failed",
      data: errors.array()
    });
};
export {validateReqSchema};
