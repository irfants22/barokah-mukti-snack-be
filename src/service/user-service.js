import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  loginUserValidation,
  registerUserValidation,
} from "../validation/user-validation.js";
import { validate } from "../validation/validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (request) => {
  const user = validate(registerUserValidation, request);

  const isUserExist = await prismaClient.user.count({
    where: {
      email: user.email,
    },
  });

  if (isUserExist === 1) {
    throw new ResponseError(400, "Pengguna ini sudah terdaftar");
  }

  user.password = await bcrypt.hash(user.password, 10);

  user.is_admin = false;

  return prismaClient.user.create({
    data: user,
    select: {
      name: true,
      email: true,
      phone: true,
    },
  });
};

const login = async (request) => {
  const loginRequest = validate(loginUserValidation, request);

  const user = await prismaClient.user.findUnique({
    where: {
      email: loginRequest.email,
    },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    throw new ResponseError(401, "Email atau Password salah");
  }

  const isPasswordValid = await bcrypt.compare(
    loginRequest.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ResponseError(401, "Email atau password salah");
  }

  const jwtSecret = process.env.JWT_SECRET_KEY;
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
    expiresIn: "24h",
  });

  return prismaClient.user.update({
    data: {
      token,
    },
    where: {
      email: user.email,
    },
    select: {
      token: true,
    },
  });
};

const getCurrentUser = async (userId) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      password: true,
      phone: true,
      gender: true,
      address: true,
      image: true,
    },
  });

  if (!user) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  return user;
};

export default {
  register,
  login,
  getCurrentUser,
};
