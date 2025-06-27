import { Router } from "express";
import userController from "../controller/user-controller.js";
import { isAuthorized } from "../middleware/auth-middleware.js";
import upload from "../middleware/upload.js";

const authorizedRouter = Router();
authorizedRouter.use(isAuthorized);

// User API (public)
authorizedRouter.get("/api/user/me", userController.getCurrentUser);
authorizedRouter.put("/api/user/me", upload.single("image"), userController.updateCurrentProfile);
authorizedRouter.delete("/api/user/logout", userController.logoutUser);

// User API (admin)
authorizedRouter.get("/api/admin/user", userController.getAllUser);
authorizedRouter.delete("/api/admin/user/delete", userController.deleteUser);

export { authorizedRouter };
