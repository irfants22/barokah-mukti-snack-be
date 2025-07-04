import notificationService from "../service/notification-service.js";

const getAllNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.getAllNotification(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateAllNotificationReadStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await notificationService.updateAllNotificationReadStatus(userId);
    res.status(200).json({
      message: "Semua notifikasi sudah dibaca",
    });
  } catch (error) {
    next(error);
  }
};

const updateNotificationReadStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.notificationId;
    await notificationService.updateNotificationReadStatus(
      userId,
      notificationId
    );
    res.status(200).json({
      message: "Notifikasi sudah dibaca",
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.notificationId;
    await notificationService.deleteNotification(userId, notificationId);
    res.status(200).json({
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllNotification,
  updateNotificationReadStatus,
  updateAllNotificationReadStatus,
  deleteNotification,
};
