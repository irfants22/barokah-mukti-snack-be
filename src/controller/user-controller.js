import userService from "../service/user-service.js";

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
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
    const result = await userService.login(req.body);
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
    const request = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      address: req.body.address,
    };
    const result = await userService.updateCurrentProfile(
      userId,
      request,
      image
    );
    res.status(200).json({
      message: "Profil pengguna berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const request = {
      query: req.query.query,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const result = await userService.getAllUser(request);
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

export default {
  register,
  login,
  getCurrentUser,
  updateCurrentProfile,
  getAllUser,
  logoutUser,
};
