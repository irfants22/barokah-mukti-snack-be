import { Router } from "express";
import userController from "../controller/user-controller.js";
import { isAuthorized } from "../middleware/auth-middleware.js";

const authorizedRouter = Router();
authorizedRouter.use(isAuthorized);

// User API
authorizedRouter.get("/api/user/me", userController.getCurrentUser);
authorizedRouter.get("/api/admin/user", userController.getAllUser);

export { authorizedRouter };
