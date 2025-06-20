import { Router } from "express";
import userController from "../controller/user-controller.js";

const publicRouter = Router();

publicRouter.get("/", (_req, res) => {
  res.status(200).send("Bagus, server telah berjalan");
});

publicRouter.post("/api/auth/register", userController.register);

export { publicRouter };
