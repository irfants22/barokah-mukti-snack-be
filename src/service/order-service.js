import { prismaClient } from "../application/database.js";
import { snap } from "../application/midtrans.js";
import { ResponseError } from "../error/response-error.js";
import { v4 as uuidv4 } from "uuid";
import { validate } from "../validation/validation.js";
import {
  getAllOrderValidation,
  orderStatusValidation,
} from "../validation/order-validation.js";

const getAllOrder = async (request) => {
  request = validate(getAllOrderValidation, request);

  const pageNumber = Math.max(1, Number(request.page) || 1);
  const limitNumber = Math.max(1, Number(request.limit) || 10);
  const offset = (pageNumber - 1) * limitNumber;
  const sortOrder = request.sortOrder || "asc";
  const { status, not } = request;

  const filters = {};

  if (status) filters.status = status;

  if (not) {
    filters.NOT = { status: not };
  }

  const orders = await prismaClient.order.findMany({
    where: filters,
    skip: offset,
    take: limitNumber,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      order_items: {
        include: {
          product: true,
        },
      },
      transaction: true,
    },
    orderBy: {
      order_time: sortOrder,
    },
  });

  const totalOrders = await prismaClient.order.count({
    where: filters,
  });

  return {
    data: orders,
    pagination: {
      page: pageNumber,
      total_page: Math.ceil(totalOrders / limitNumber),
      total_orders: totalOrders,
    },
  };
};

const getCurrentOrder = async (userId, status) => {
  status = validate(orderStatusValidation, status);

  const filters = status ? { status } : {};

  const totalOrders = await prismaClient.order.count({
    where: {
      user_id: userId,
      ...filters,
    },
  });

  const orders = await prismaClient.order.findMany({
    where: {
      user_id: userId,
      ...filters,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      order_items: {
        include: {
          product: true,
        },
      },
      transaction: true,
    },
    orderBy: {
      order_time: "desc",
    },
  });

  return {
    data: orders,
    total_orders: totalOrders,
  };
};

const getOrderDetail = async (orderId) => {
  const isOrderExist = await prismaClient.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!isOrderExist) {
    throw new ResponseError(404, "Pesanan tidak ditemukan");
  }

  const order = await prismaClient.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      order_items: {
        include: {
          product: true,
        },
      },
      transaction: true,
    },
    orderBy: {
      order_time: "asc",
    },
  });

  return order;
};

const createOrder = async (userId, address, notes, other_costs) => {
  const cartItems = await prismaClient.cartItem.findMany({
    where: { user_id: userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new ResponseError(400, "Keranjang belanja anda kosong");
  }

  const orderCost = cartItems.reduce((total, item) => total + item.price, 0);

  const totalPrice = orderCost + other_costs;

  const order = await prismaClient.order.create({
    data: {
      status: "DIPROSES",
      total_price: totalPrice,
      address,
      notes,
      user_id: userId,
      order_items: {
        create: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      user: true,
      order_items: true,
    },
  });

  if (!order.user) {
    throw new ResponseError(500, "Data pengguna tidak tersedia pada pesanan");
  }

  const transactionId = uuidv4();

  const snapResponse = await snap.createTransaction({
    transaction_details: {
      order_id: order.id,
      gross_amount: totalPrice,
    },
    customer_details: {
      first_name: order.user.name,
      email: order.user.email,
    },
    enabled_payments: ["bca_va"],
    callbacks: {
      finish: "http://localhost:5173/my-order",
    },
  });

  await prismaClient.transaction.create({
    data: {
      transaction_id: transactionId,
      gross_amount: totalPrice,
      payment_type: "bca_va",
      order_id: order.id,
    },
  });

  await prismaClient.notification.create({
    data: {
      user_id: userId,
      message: `Pesanan #${order.id} berhasil dibuat.`,
    },
  });

  const admin = await prismaClient.user.findFirst({
    where: {
      is_admin: true,
    },
  });

  await prismaClient.notification.create({
    data: {
      user_id: admin.id,
      message: `Pesanan #${order.id} berhasil dibuat.`,
    },
  });

  for (const item of cartItems) {
    const averageRateOfUsage = 5;
    const leadTime = 3;
    const safetyStock = 5;
    const rop = averageRateOfUsage * leadTime + safetyStock;

    const product = await prismaClient.product.findUnique({
      where: { id: item.product_id },
    });

    const remainingStock = product.stock - item.quantity;

    if (remainingStock < rop && remainingStock > 10) {
      await prismaClient.notification.create({
        data: {
          user_id: admin.id,
          message: `Stok produk ${product.name} menipis. Segera lakukan restok!.`,
        },
      });
    }
    if (remainingStock < 10) {
      await prismaClient.notification.create({
        data: {
          user_id: admin.id,
          message: `Stok produk ${product.name} tersisa ${remainingStock} buah. Segera lakukan restok!.`,
        },
      });
    }

    await prismaClient.product.update({
      where: { id: item.product_id },
      data: {
        stock: product.stock - item.quantity,
      },
    });
  }

  await prismaClient.cartItem.deleteMany({ where: { user_id: userId } });

  return {
    order_id: order.id,
    snap_token: snapResponse.token,
    redirect_url: snapResponse.redirect_url,
  };
};

const updateOrder = async (userId, orderId, status) => {
  status = validate(orderStatusValidation, status);

  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const isOrderExist = await prismaClient.order.findFirst({
    where: {
      id: orderId,
    },
  });

  if (!isOrderExist) {
    throw new ResponseError(404, "Pesanan tidak ditemukan");
  }

  const updatedOrder = await prismaClient.order.update({
    where: {
      id: orderId,
    },
    data: { status },
  });

  const admin = await prismaClient.user.findFirst({
    where: {
      is_admin: true,
    },
  });

  const orderOwner = await prismaClient.user.findFirst({
    where: {
      id: isOrderExist.user_id,
    },
  });

  const capitalizeStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  await prismaClient.notification.create({
    data: {
      user_id: admin.id,
      message: `Pesanan #${isOrderExist.id} telah ${capitalizeStatus}.`,
    },
  });

  await prismaClient.notification.create({
    data: {
      user_id: orderOwner.id,
      message: `Pesanan #${isOrderExist.id} telah ${capitalizeStatus}.`,
    },
  });

  return updatedOrder;
};

export default {
  getAllOrder,
  createOrder,
  updateOrder,
  getCurrentOrder,
  getOrderDetail,
};
