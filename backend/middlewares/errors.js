const ErrorHandler = require("../utilities/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };

    error.message = err.message;

    // Error mongoose invalid ID => url dengan Id Produk yang tidak sesuai
    if (err.name === "CastError") {
      const message = `data tidak ditemukan di database, ${err.path} tidak sesuai`;
      error = new ErrorHandler(message, 400);
    }

    // Error validasi mongoose => saat membuat produk baru
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 400);
    }

    // Error mongoose duplicate => mendaftar dengan email yang sama
    if (err.code === 11000) {
      const message = `${Object.keys(err.keyValue)} sudah terdaftar`;
      error = new ErrorHandler(message, 400);
    }

    // JWT Wrong Error
    if (err.name === "JsonWebTokenError") {
      const message = "Web Token Salah, Silahkan Coba Lagi!!!";
      error = new ErrorHandler(message, 400);
    }

    //JWT Expired Error
    if (err.name === "TokenExpiredError") {
      const message = "Token kaladuarsa, Silahkan Coba Lagi!!!";
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
