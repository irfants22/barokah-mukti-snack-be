import { prismaClient } from "../application/database.js";
import jwt from "jsonwebtoken";

export const isAuthorized = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ errors: "Anda tidak memiliki izin" });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const payload = jwt.verify(token, jwtSecretKey);

    const user = await prismaClient.user.findFirst({
      where: {
        id: payload.id,
        token,
      },
    });

    if (!user) {
      return res.status(401).json({ errors: "Anda tidak memiliki izin" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ errors: "Tidak sah atau Token sudah kadaluarsa" });
  }
};

export const isAdmin = async (req, res, next) => {
  const { is_admin } = req.user;

  if (!is_admin) {
    return res
      .status(403)
      .json({ errors: "Anda tidak memiliki akses sebagai admin" });
  }

  next();
};
