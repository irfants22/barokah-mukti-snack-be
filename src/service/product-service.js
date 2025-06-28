import fs from "fs";
import cloudinary from "../application/cloudinary.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  createProductValidation,
  getAllProductValidation,
  updateProductValidation,
} from "../validation/product-validation.js";
import { validate } from "../validation/validation.js";
import { ProductCategory } from "@prisma/client";

const getAllProduct = async (request) => {
  request = validate(getAllProductValidation, request);

  const pageNumber = Math.max(1, Number(request.page) || 1);
  const limitNumber = Math.max(1, Number(request.limit) || 10);
  const offset = (pageNumber - 1) * limitNumber;

  const nameQuery = request.query || "";
  const categoryQuery = request.category || "";
  const sortOrderInput = request.sortOrder || "asc";
  const sortByInput = request.sortBy || "name";

  let sortBy = "name";
  let sortOrder = "asc";

  if (sortOrderInput === "lowest_price") {
    sortBy = "price";
    sortOrder = "asc";
  } else if (sortOrderInput === "highest_price") {
    sortBy = "price";
    sortOrder = "desc";
  } else {
    const allowedSortFields = [
      "name",
      "price",
      "stock",
      "category",
      "packaging",
      "weight",
      "created_at",
    ];
    const allowedSortOrder = ["asc", "desc"];

    sortBy = allowedSortFields.includes(sortByInput) ? sortByInput : "name";
    sortOrder = allowedSortOrder.includes(sortOrderInput)
      ? sortOrderInput
      : "asc";
  }

  const filters = {
    AND: [
      nameQuery && {
        name: { contains: nameQuery, mode: "insensitive" },
      },
      categoryQuery &&
      Object.values(ProductCategory).includes(categoryQuery.toUpperCase())
        ? {
            category: {
              equals: categoryQuery.toUpperCase(),
            },
          }
        : {},
    ].filter(Boolean),
  };

  const products = await prismaClient.product.findMany({
    where: filters,
    skip: offset,
    take: limitNumber,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      description: true,
      image: true,
      category: true,
      packaging: true,
      weight: true,
    },
  });

  const totalProducts = await prismaClient.product.count({ where: filters });

  return {
    data: products,
    pagination: {
      page: pageNumber,
      total_page: Math.ceil(totalProducts / limitNumber),
      total_products: totalProducts,
    },
  };
};

const getDetailProduct = async (productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      order_items: true,
    },
  });

  if (!product) {
    throw new ResponseError(404, "Produk tidak ditemukan");
  }

  return product;
};

const createProduct = async (request, image) => {
  request = validate(createProductValidation, request);

  let imageUrl = null;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image.path, {
      folder: "products",
    });
    imageUrl = uploadResponse.secure_url;
    await fs.promises.unlink(image.path);
  }

  const newProduct = await prismaClient.product.create({
    data: {
      ...request,
      image: imageUrl,
    },
  });

  return newProduct;
};

const updateProduct = async (productId, request, image) => {
  request = validate(updateProductValidation, request);

  const existingProduct = await prismaClient.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!existingProduct) {
    throw new ResponseError(404, "Produk tidak ditemukan");
  }

  let imageUrl = existingProduct.image;
  if (image) {
    if (existingProduct.image) {
      const publicId = existingProduct.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }
    const uploadResponse = await cloudinary.uploader.upload(image.path, {
      folder: "products",
    });
    imageUrl = uploadResponse.secure_url;
    await fs.promises.unlink(image.path);
  }

  const updatedProduct = await prismaClient.product.update({
    where: {
      id: productId,
    },
    data: {
      ...request,
      image: imageUrl,
    },
  });

  return updatedProduct;
};

const deleteProduct = async (productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new ResponseError(404, "Produk tidak ditemukan");
  }

  if (product.image) {
    const publicId = product.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);
  }
  return prismaClient.product.delete({
    where: {
      id: productId,
    },
  });
};

export default {
  getAllProduct,
  getDetailProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
