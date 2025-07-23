import { Router } from "express";
import upload from "../middleware/upload.js";
import { isAuthorized, isAdmin } from "../middleware/auth-middleware.js";
import userController from "../controller/user-controller.js";
import productController from "../controller/product-controller.js";
import cartController from "../controller/cart-controller.js";
import orderController from "../controller/order-controller.js";
import notificationController from "../controller/notification-controller.js";

const authorizedRouter = Router();
authorizedRouter.use(isAuthorized);

// User API (public)
authorizedRouter.get("/api/users/me", userController.getCurrentUser);
authorizedRouter.put("/api/users/me", upload.single("image"), userController.updateCurrentProfile);
authorizedRouter.delete("/api/users/logout", userController.logoutUser);

// User API (admin)
authorizedRouter.get("/api/admin/users", isAdmin, userController.getAllUser);
authorizedRouter.get("/api/admin/users/me", isAdmin, userController.getCurrentUser);
authorizedRouter.put("/api/admin/users/me", isAdmin, upload.single("image"), userController.updateCurrentProfile);
authorizedRouter.delete("/api/admin/users/delete", isAdmin, userController.deleteUser);

// Product API (admin)
authorizedRouter.get("/api/admin/products", isAdmin, productController.getAllProduct);
authorizedRouter.get("/api/admin/products/:productId", isAdmin, productController.getDetailProduct);
authorizedRouter.post("/api/admin/products", upload.single("image"), isAdmin, productController.createProduct);
authorizedRouter.put("/api/admin/products/:productId", upload.single("image"), isAdmin, productController.updateProduct);
authorizedRouter.delete("/api/admin/products/:productId", isAdmin, productController.deleteProduct);

// Cart API (public)
authorizedRouter.get("/api/carts", cartController.getAllCart);
authorizedRouter.post("/api/carts", cartController.createCart);
authorizedRouter.put("/api/carts/:cartId", cartController.updateCart);
authorizedRouter.delete("/api/carts/:cartId", cartController.deleteCart);

// Order API (public)
authorizedRouter.get("/api/orders", orderController.getAllOrder);
authorizedRouter.post("/api/orders", orderController.createOrder);
authorizedRouter.get("/api/orders/me", orderController.getCurrentOrder);
authorizedRouter.get("/api/orders/:orderId", orderController.getOrderDetail);
authorizedRouter.put("/api/orders/:orderId/status", orderController.updateOrder);

// Order API (admin)
authorizedRouter.get("/api/admin/orders", isAdmin, orderController.getAllOrder);
authorizedRouter.get("/api/admin/orders/:orderId", isAdmin, orderController.getOrderDetail);
authorizedRouter.put("/api/admin/orders/:orderId/status", isAdmin, orderController.updateOrder);

// Notification API (public)
authorizedRouter.get("/api/notifications", notificationController.getAllNotification)
authorizedRouter.put("/api/notifications/read-all", notificationController.updateAllNotificationReadStatus)
authorizedRouter.put("/api/notifications/:notificationId/read", notificationController.updateNotificationReadStatus)
authorizedRouter.delete("/api/notifications/:notificationId", notificationController.deleteNotification)

export { authorizedRouter };
