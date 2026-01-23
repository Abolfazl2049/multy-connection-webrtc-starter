import {ErrorRequestHandler} from "express";
import {MyError} from "./model.js";
import {ErrorResponse} from "../response/error.model.js";
let errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    if (err instanceof MyError) {
      res.status(err.statusCode).json(new ErrorResponse({message: err.message, data: err.data}));
    } else {
      res.status(500).json(
        new ErrorResponse({
          message: err.message ?? "Internal Server Error",
          data: err
        })
      );
    }
  }
};
export {errorHandler};
