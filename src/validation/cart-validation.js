import Joi from "joi";

const createCartValidation = Joi.object({
  price: Joi.number().positive().required(),
  quantity: Joi.number().min(1).positive().required(),
});

const updateCartValidation = Joi.object({
  quantity: Joi.number().min(1).positive().optional(),
});

export { createCartValidation, updateCartValidation };
