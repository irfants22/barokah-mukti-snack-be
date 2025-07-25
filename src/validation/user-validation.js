import Joi from "joi";

const registerUserValidation = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().max(100).email().required(),
  password: Joi.string().max(100).required(),
  phone: Joi.string().max(25).required(),
});

const loginUserValidation = Joi.object({
  email: Joi.string().max(100).email().required(),
  password: Joi.string().max(100).required(),
});

const getAllUserValidation = Joi.object({
  query: Joi.string().optional(),
  page: Joi.number().positive().min(1).default(1),
  limit: Joi.number().max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().optional(),
});

const updateUserValidation = Joi.object({
  name: Joi.string().max(100).optional(),
  email: Joi.string().max(100).email().optional(),
  phone: Joi.string().max(20).optional(),
  gender: Joi.string().valid("LAKI_LAKI", "PEREMPUAN").optional(),
  address: Joi.string().optional(),
});

export {
  registerUserValidation,
  loginUserValidation,
  getAllUserValidation,
  updateUserValidation,
};
