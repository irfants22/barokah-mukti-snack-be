import userService from "../service/user-service.js";

const register = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await userService.register(payload);
    res.status(201).json({
      message: "Pengguna berhasil mendaftar",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await userService.login(payload);
    res.status(200).json({
      message: "Pengguna berhasil login",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.getCurrentUser(userId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCurrentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const image = req.file;
    const payload = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      address: req.body.address,
    };
    const result = await userService.updateCurrentProfile(
      userId,
      payload,
      image
    );
    res.status(200).json({
      message: "Informasi pengguna berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const payload = {
      query: req.query.query,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const result = await userService.getAllUser(payload);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await userService.logoutUser(userId);
    res.status(200).json({
      message: "Pengguna berhasil logout",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id: userId } = req.body;
    await userService.deleteUser(userId);
    res.status(200).json({
      message: "Pengguna berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

const createAdminUser = async (_req, res, next) => {
  try {
    const result = await userService.createAdminUser();
    res.status(201).json({
      message: "Admin berhasil dibuat",
      data: result,
    });
  } catch (error) {
    next(error);
  }
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
