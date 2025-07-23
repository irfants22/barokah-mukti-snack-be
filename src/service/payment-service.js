import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prismaClient } from "../application/database.js";
import { snap } from "../application/midtrans.js";
import { ResponseError } from "../error/response-error.js";

const processPaymentNotification = async (notification) => {
  const statusResponse = await snap.transaction.notification(notification);

  const {
    order_id,
    transaction_id,
    payment_type,
    transaction_status,
    gross_amount,
    transaction_time,
    settlement_time,
    va_numbers,
    permata_va_number,
    bill_key,
    biller_code,
  } = statusResponse;

  if (!order_id) {
    throw new ResponseError(400, "ID pesanan tidak ditemukan");
  }

  const existingOrder = await prismaClient.order.findUnique({
    where: { id: order_id },
    include: { transaction: true },
  });

  if (!existingOrder) {
    throw new ResponseError(404, "Pesanan tidak ditemukan");
  }

  // Tentukan status pembayaran
  let paymentStatus = PaymentStatus.PENDING;

  if (transaction_status === "settlement" || transaction_status === "capture") {
    paymentStatus = PaymentStatus.SUKSES;
  } else if (transaction_status === "expire") {
    paymentStatus = PaymentStatus.KADALUARSA;
  } else if (transaction_status === "cancel") {
    paymentStatus = PaymentStatus.DIBATALKAN;
  } else if (transaction_status === "deny") {
    paymentStatus = PaymentStatus.GAGAL;
  }

  // Ambil kode bayar
  let payment_code = null;
  if (payment_type === "bank_transfer" && va_numbers?.length > 0) {
    payment_code = va_numbers[0].va_number;
  } else if (permata_va_number) {
    payment_code = permata_va_number;
  } else if (bill_key || biller_code) {
    payment_code = `${bill_key ?? ""}${biller_code ?? ""}`;
  }

  // Waktu pembayaran
  const paidAt =
    paymentStatus === PaymentStatus.SUKSES
      ? new Date(settlement_time || transaction_time || Date.now())
      : null;

  // Update atau buat transaksi
  if (existingOrder.transaction) {
    await prismaClient.transaction.update({
      where: { order_id },
      data: {
        transaction_id,
        payment_type,
        payment_code,
        gross_amount: parseInt(gross_amount),
        paid_at: paidAt,
        status: paymentStatus,
        transaction_time: new Date(transaction_time || Date.now()),
      },
    });
  } else {
    await prismaClient.transaction.create({
      data: {
        order_id,
        transaction_id,
        payment_type,
        payment_code,
        gross_amount: parseInt(gross_amount),
        paid_at: paidAt,
        status: paymentStatus,
        transaction_time: new Date(transaction_time || Date.now()),
      },
    });
  }

  // Buat notifikasi untuk admin dan user
  const admin = await prismaClient.user.findFirst({
    where: {
      is_admin: true,
    },
  });

  const orderOwner = await prismaClient.user.findFirst({
    where: {
      id: existingOrder.user_id,
    },
  });

  // Update status order jika pembayaran sukses
  if (paymentStatus === PaymentStatus.SUKSES) {
    await prismaClient.order.update({
      where: { id: order_id },
      data: { status: OrderStatus.DIBAYAR },
    });

    // Buat notifikasi untuk admin dan user
    await prismaClient.notification.create({
      data: {
        user_id: admin.id,
        message: `Pesanan #${existingOrder.id} berhasil Dibayar.`,
      },
    });

    await prismaClient.notification.create({
      data: {
        user_id: orderOwner.id,
        message: `Pesanan #${existingOrder.id} berhasil Dibayar.`,
      },
    });
  }

  return {
    order_id,
    transaction_id,
    status: paymentStatus,
  };
};

export default { processPaymentNotification };
