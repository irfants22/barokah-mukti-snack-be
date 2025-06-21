import { Router } from "express";
import userController from "../controller/user-controller.js";
import { isAuthorized } from "../middleware/auth-middleware.js";

const authorizedRouter = Router();
authorizedRouter.use(isAuthorized);

authorizedRouter.get("/api/user/me", userController.getCurrentUser);

export { authorizedRouter };
