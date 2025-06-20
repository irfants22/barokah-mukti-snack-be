import Joi from "joi";

const registerUserValidation = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().max(100).email().required(),
  password: Joi.string().max(100).required(),
  phone: Joi.string().max(25).required(),
});

const loginUserValidation = Joi.object({
  email: Joi.string().max(100).email().required(),
  password: Joi.string().max(25).required(),
});

export { registerUserValidation, loginUserValidation };
