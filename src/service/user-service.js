import fs from "fs";
import cloudinary from "../application/cloudinary.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  getAllUserValidation,
  loginUserValidation,
  registerUserValidation,
  updateUserValidation,
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

  const newUser = await prismaClient.user.create({
    data: user,
    select: {
      name: true,
      email: true,
      phone: true,
    },
  });

  return newUser;
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

  const loggedInUser = await prismaClient.user.update({
    data: {
      token,
    },
    where: {
      email: user.email,
    },
    select: {
      token: true,
      is_admin: true,
    },
  });

  return loggedInUser;
};

const getCurrentUser = async (userId) => {
  const currentUser = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      gender: true,
      address: true,
      image: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!currentUser) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  return currentUser;
};

const updateCurrentProfile = async (userId, request, image) => {
  request = validate(updateUserValidation, request);

  const existingUser = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  let imageUrl = existingUser.image;
  if (image) {
    if (existingUser.image) {
      const publicId = existingUser.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`users/${publicId}`);
    }
    const uploadResponse = await cloudinary.uploader.upload(image.path, {
      folder: "users",
    });
    imageUrl = uploadResponse.secure_url;
    await fs.promises.unlink(image.path);
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      ...request,
      image: imageUrl,
    },
  });

  return updatedUser;
};

const getAllUser = async (request) => {
  request = validate(getAllUserValidation, request);

  const pageNumber = Math.max(1, Number(request.page) || 1);
  const limitNumber = Math.max(1, Number(request.limit) || 10);
  const offset = (pageNumber - 1) * limitNumber;

  const allowedSortFields = ["name", "email", "phone", "gender", "created_at"];
  const allowedSortOrder = ["asc", "desc"];

  const sortBy = allowedSortFields.includes(request.sortBy)
    ? request.sortBy
    : "name";
  const sortOrder = allowedSortOrder.includes(request.sortOrder)
    ? request.sortOrder
    : "asc";
  const query = request.query;

  const filters = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  const users = await prismaClient.user.findMany({
    where: filters,
    skip: offset,
    take: limitNumber,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      address: true,
      image: true,
      is_admin: true,
      created_at: true,
      updated_at: true,
    },
  });

  const totalUsers = await prismaClient.user.count({
    where: filters,
  });

  return {
    data: users,
    pagination: {
      page: pageNumber,
      total_page: Math.ceil(totalUsers / limitNumber),
      total_users: totalUsers,
    },
  };
};

const logoutUser = async (userId) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  return prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      token: null,
    },
  });
};

const deleteUser = async (userId) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  if (user.is_admin) {
    throw new ResponseError(403, "Tidak dapat menghapus akun admin");
  }

  if (user.token !== null) {
    throw new ResponseError(
      403,
      "Tidak dapat menghapus pengguna yang sedang login"
    );
  }

  return prismaClient.user.delete({
    where: {
      id: user.id,
    },
  });
};

const createAdminUser = async () => {
  const existingAdmin = await prismaClient.user.findFirst({
    where: { is_admin: true },
  });

  if (existingAdmin) {
    throw new ResponseError(400, "Admin sudah terdaftar");
  }

  const newAdmin = await prismaClient.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      phone: "08123456789",
      gender: "LAKI_LAKI",
      address: "Jl. Melati No. 123",
      is_admin: true,
    },
  });
  console.log("Admin user created");
  return newAdmin;
};

export default {
  register,
  login,
  getCurrentUser,
  updateCurrentProfile,
  getAllUser,
  logoutUser,
  deleteUser,
  createAdminUser,
};
