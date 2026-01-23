import {NextFunction, Request, Response} from "express";
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.uniqueId = (Math.random() + 1).toString(36).substring(2);
  console.log("=======>");
  console.log(`New Request`);
  // @ts-ignore
  console.log(`UniqueID : ${req.uniqueId}`);
  console.log(`Path : ${req.path}`);
  console.log(`Is Authorized : ${JSON.stringify(req.user) ? true : false}`);
  console.log(`Method : ${req.method}`);
  console.log(`Body : ${JSON.stringify(req.body)}`);
  next();
};

const logResponse = (res: {status: number; data: any; uniqueId: string}) => {
  console.log("<=======");
  console.log("New Response");
  console.log(`UniqueID : ${res.uniqueId}`);
  console.log(`Status : ${res.status}`);
  console.log(`Data : ${JSON.stringify(res.data)}`);
};
export {requestLogger, logResponse};
