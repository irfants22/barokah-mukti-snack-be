import paymentService from "../service/payment-service.js";

const handlePaymentNotification = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await paymentService.processPaymentNotification(payload);
    res
      .status(200)
      .json({ message: "Notifikasi pembayaran diproses", data: result });
  } catch (error) {
    next(error);
  }
};

export default {
  handlePaymentNotification,
};
