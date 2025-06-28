import Joi from "joi";

const getAllProductValidation = Joi.object({
  query: Joi.string().optional(),
  category: Joi.string().valid("MAKANAN_RINGAN", "KUE_KERING").optional(),
  page: Joi.number().positive().min(1).default(1),
  limit: Joi.number().max(10).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string()
    .valid("asc", "desc", "lowest_price", "highest_price")
    .optional(),
});

const createProductValidation = Joi.object({
  name: Joi.string().max(100).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().positive().required(),
  description: Joi.string().optional(),
  category: Joi.string().valid("MAKANAN_RINGAN", "KUE_KERING").required(),
  packaging: Joi.string().valid("TOPLES", "BAL").required(),
  weight: Joi.string().valid("GRAM_250", "GRAM_500", "KG_1", "KG_2").required(),
});

const updateProductValidation = Joi.object({
  name: Joi.string().max(100).optional(),
  price: Joi.number().positive().optional(),
  stock: Joi.number().positive().optional(),
  description: Joi.string().optional(),
  category: Joi.string().valid("MAKANAN_RINGAN", "KUE_KERING").optional(),
  packaging: Joi.string().valid("TOPLES", "BAL").optional(),
  weight: Joi.string().valid("GRAM_250", "GRAM_500", "KG_1", "KG_2").optional(),
});

export {
  getAllProductValidation,
  createProductValidation,
  updateProductValidation,
};
