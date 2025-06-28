import productService from "../service/product-service.js";

const getAllProduct = async (req, res, next) => {
  try {
    const request = {
      query: req.query.query,
      category: req.query.category,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const result = await productService.getAllProduct(request);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getDetailProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const result = await productService.getDetailProduct(productId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const request = {
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      description: req.body.description,
      category: req.body.category,
      packaging: req.body.packaging,
      weight: req.body.weight,
    };
    const image = req.file;
    const result = await productService.createProduct(request, image);
    res.status(201).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const image = req.file;
    const request = {
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      description: req.body.description,
      category: req.body.category,
      packaging: req.body.packaging,
      weight: req.body.weight,
    };
    const result = await productService.updateProduct(
      productId,
      request,
      image
    );
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    await productService.deleteProduct(productId);
    res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllProduct,
  getDetailProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
