import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import {errorHandler} from "./gears/error/error-handler.js";
import {router} from "./router.js";
import {applyLimiter} from "./libs/limiter/index.js";
import {requestLogger} from "./gears/logger.js";
import {APP_PORT} from "./services/shared/constants/index.js";
import {initSocketIO} from "./services/socket/app.js";

const app = express();
const server = http.createServer(app);

//  app basic settings
app.use(applyLimiter());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// static files
app.use(express.static("public"));

// custom middlewares
app.use(requestLogger);

// app router
app.use(router);

// error handler
app.use(errorHandler);

// initialize socket.io
initSocketIO(server);

// app listen
server.listen(APP_PORT, () => {
  console.log(`http://localhost:${APP_PORT}`);
});
export default app;
export {server};
