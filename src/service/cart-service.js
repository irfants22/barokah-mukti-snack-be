import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  createCartValidation,
  updateCartValidation,
} from "../validation/cart-validation.js";
import { validate } from "../validation/validation.js";

const getAllCart = async (userId) => {
  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const carts = await prismaClient.cartItem.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "asc",
    },
    include: {
      product: true,
    },
  });

  const totalCarts = await prismaClient.cartItem.count({
    where: {
      user_id: userId,
    },
  });

  return {
    data: carts,
    total_carts: totalCarts,
  };
};

const createCart = async (userId, productId, request) => {
  request = validate(createCartValidation, request);

  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const isProductAvailable = await prismaClient.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!isProductAvailable) {
    throw new ResponseError(404, "Produk tidak ditemukan");
  }

  const totalPrice = request.quantity * request.price;

  const newCart = await prismaClient.cartItem.create({
    data: {
      price: totalPrice,
      quantity: request.quantity,
      user: {
        connect: { id: userId },
      },
      product: {
        connect: { id: productId },
      },
    },
  });

  return newCart;
};

const updateCart = async (cartId, request) => {
  request = validate(updateCartValidation, request);

  const isCartExist = await prismaClient.cartItem.findUnique({
    where: {
      id: cartId,
    },
  });

  if (!isCartExist) {
    throw new ResponseError(404, "Cart tidak ditemukan");
  }

  const product = await prismaClient.product.findUnique({
    where: { id: isCartExist.product_id },
  });
  const totalPrice = product.price * request.quantity;

  const updatedCart = await prismaClient.cartItem.update({
    where: {
      id: cartId,
    },
    data: {
      quantity: request.quantity,
      price: totalPrice,
    },
  });

  return updatedCart;
};

const deleteCart = async (cartId) => {
  const isCartExist = await prismaClient.cartItem.findUnique({
    where: {
      id: cartId,
    },
  });

  if (!isCartExist) {
    throw new ResponseError(404, "Cart tidak ditemukan");
  }

  return prismaClient.cartItem.delete({
    where: {
      id: cartId,
    },
  });
};

export default {
  getAllCart,
  createCart,
  updateCart,
  deleteCart,
};
