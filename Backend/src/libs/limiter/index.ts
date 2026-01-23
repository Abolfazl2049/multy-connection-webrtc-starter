import {rateLimit} from "express-rate-limit";

let applyLimiter = (minute: number = 15, maxReq: number = 1000) => {
  return rateLimit({
    windowMs: minute * 60 * 1000,
    limit: maxReq,
    standardHeaders: "draft-8",
    legacyHeaders: false
  });
};

export {applyLimiter};
