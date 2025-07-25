import express from "express";
import cors from "cors";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { authorizedRouter } from "../route/api.js";

export const web = express();
web.use(cors());
web.use(express.json());

web.use(publicRouter);
web.use(authorizedRouter);

web.use(errorMiddleware);
