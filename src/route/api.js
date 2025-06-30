import { Router } from "express";
import upload from "../middleware/upload.js";
import { isAuthorized } from "../middleware/auth-middleware.js";
import userController from "../controller/user-controller.js";
import productController from "../controller/product-controller.js";
import cartController from "../controller/cart-controller.js";

const authorizedRouter = Router();
authorizedRouter.use(isAuthorized);

// User API (public)
authorizedRouter.get("/api/users/me", userController.getCurrentUser);
authorizedRouter.put("/api/users/me", upload.single("image"), userController.updateCurrentProfile);
authorizedRouter.delete("/api/users/logout", userController.logoutUser);

// User API (admin)
authorizedRouter.get("/api/admin/users", userController.getAllUser);
authorizedRouter.delete("/api/admin/users/delete", userController.deleteUser);

// Product API (public)
authorizedRouter.get("/api/products", productController.getAllProduct);
authorizedRouter.get("/api/products/:productId", productController.getDetailProduct);

// Product API (admin)
authorizedRouter.get("/api/admin/products", productController.getAllProduct);
authorizedRouter.get("/api/admin/products/:productId", productController.getDetailProduct);
authorizedRouter.post("/api/admin/products", upload.single("image"), productController.createProduct);
authorizedRouter.put("/api/admin/products/:productId", upload.single("image"), productController.updateProduct);
authorizedRouter.delete("/api/admin/products/:productId", productController.deleteProduct);

// Cart API (public)
authorizedRouter.get("/api/carts", cartController.getAllCart);
authorizedRouter.post("/api/carts", cartController.createCart);
authorizedRouter.put("/api/carts/:cartId", cartController.updateCart);
authorizedRouter.delete("/api/carts/:cartId", cartController.deleteCart);

export { authorizedRouter };
