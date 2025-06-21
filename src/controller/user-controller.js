import userService from "../service/user-service.js";

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(200).json({
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

export default { register, login, getCurrentUser };
