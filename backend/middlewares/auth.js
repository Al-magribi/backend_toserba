const jwt = require("jsonwebtoken");
const User = require("../models/users");
const ErrorHandler = require("../utilities/ErrorHandler");
const catchError = require("../middlewares/catchError");

exports.authenticatedUser = catchError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Login first to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});
// Membatasi peran untuk mengakses halaman admin
// Role handler
exports.authorizeRoles = (...roles) => {
  return catchError(async (req, res, next) => {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Akun anda ${req.user.role} tidak diizinkan untuk mengakses halaman ini`,
          403
        )
      );
    }
    next();
  });
};
