import cartService from "../service/cart-service.js";

const getAllCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await cartService.getAllCart(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.body.product_id;
    const request = {
      price: req.body.price,
      quantity: req.body.quantity,
    };
    const result = await cartService.createCart(userId, productId, request);
    res.status(201).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    const request = {
      quantity: req.body.quantity,
    };
    const result = await cartService.updateCart(cartId, request);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    await cartService.deleteCart(cartId);
    res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCart,
  createCart,
  updateCart,
  deleteCart,
};
