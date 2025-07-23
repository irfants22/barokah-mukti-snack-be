import { Router } from "express";
import userController from "../controller/user-controller.js";
import productController from "../controller/product-controller.js";
import paymentController from "../controller/payment-controller.js";

const publicRouter = Router();

publicRouter.get("/", (_req, res) => {
  res.status(200).send("Bagus, server telah berjalan");
});

// Auth API
publicRouter.post("/api/auth/register", userController.register);
publicRouter.post("/api/auth/login", userController.login);

// Product API
publicRouter.get("/api/products", productController.getAllProduct);
publicRouter.get("/api/products/:productId", productController.getDetailProduct);

// Payment API
publicRouter.post("/api/payment/notification", paymentController.handlePaymentNotification);

// Create Admin Alternative
publicRouter.post("/api/create/admin", userController.createAdminUser);

export { publicRouter };
