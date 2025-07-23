import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

const getAllNotification = async (userId) => {
  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const totalNotifications = await prismaClient.notification.count({
    where: {
      user_id: userId,
    },
  });

  const notifications = await prismaClient.notification.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return {
    data: notifications,
    total_notifications: totalNotifications,
  };
};

const updateAllNotificationReadStatus = async (userId) => {
  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const totalNotifications = await prismaClient.notification.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });

  if (totalNotifications !== 0) {
    return await prismaClient.notification.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        is_read: true,
      },
    });
  }

  return;
};

const updateNotificationReadStatus = async (userId, notificationId) => {
  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const isNotificationExist = await prismaClient.notification.findUnique({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });

  if (!isNotificationExist) {
    throw new ResponseError(404, "Notifikasi tidak ditemukan");
  }

  if (!isNotificationExist.is_read) {
    return await prismaClient.notification.update({
      where: {
        id: notificationId,
        user_id: userId,
      },
      data: {
        is_read: true,
      },
    });
  }

  return;
};

const deleteNotification = async (userId, notificationId) => {
  const isUserExist = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  const isNotificationExist = await prismaClient.notification.findUnique({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });

  if (!isNotificationExist) {
    throw new ResponseError(404, "Notifikasi tidak ditemukan");
  }

  await prismaClient.notification.delete({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });

  return;
};

export default {
  getAllNotification,
  updateNotificationReadStatus,
  updateAllNotificationReadStatus,
  deleteNotification,
};
