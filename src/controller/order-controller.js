import orderService from "../service/order-service.js";

const getAllOrder = async (req, res, next) => {
  try {
    const request = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
      sortOrder: req.query.sortOrder,
      not: req.query.not,
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
    const orderId = req.params.orderId;
    const result = await orderService.getOrderDetail(orderId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address, notes, other_costs } = req.body;
    const result = await orderService.createOrder(
      userId,
      address,
      notes,
      other_costs
    );
    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
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
