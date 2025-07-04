import Joi from "joi";

const orderStatusValidation = Joi.string()
  .valid("DIPROSES", "DIBAYAR", "DIKIRIM", "SELESAI", "DIBATALKAN")
  .optional();

const getAllOrderValidation = Joi.object({
  status: orderStatusValidation,
  page: Joi.number().positive().min(1).default(1),
  limit: Joi.number().max(10).default(10),
  sortOrder: Joi.string().default("asc").optional(),
});

export { getAllOrderValidation, orderStatusValidation };
