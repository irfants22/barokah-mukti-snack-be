import orderService from "../service/order-service.js";

const getAllOrder = async (req, res, next) => {
  try {
    const request = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await orderService.getAllOrder(request);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCurrentOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const status = req.query.status;
    const result = await orderService.getCurrentOrder(userId, status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const result = await orderService.getOrderDetail(userId, orderId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address, notes } = req.body;
    const result = await orderService.createOrder(userId, address, notes);
    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const status = req.body.status;
    const result = await orderService.updateOrder(userId, orderId, status);
    res.status(201).json({
      message: "Status pesanan berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOrder,
  createOrder,
  updateOrder,
  getCurrentOrder,
  getOrderDetail,
};
