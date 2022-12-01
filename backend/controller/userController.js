const User = require("../models/users");
const catchError = require("../middlewares/catchError");
const cloudinary = require("cloudinary");
const crypto = require("crypto");
const ErrorHandler = require("../utilities/ErrorHandler");
const sendToken = require("../utilities/cookie");
const sendEmail = require("../utilities/sendEmail");

exports.registerUser = catchError(async (req, res, next) => {
  // Cloudinary configuration upload
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "Avatars",
    width: 150,
    crop: "scale",
  });

  const { nama, email, password } = req.body;

  const user = await User.create({
    nama,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  // JSON WEB TOKEN
  sendToken(user, 200, res);

  // const token = user.getJwtToken();

  // res.status(201).json({
  //   success: true,
  //   token,
  // });
});

// Route Umum => admin & Client
// Login user
exports.loginUser = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  // Cek entri email dan password oleh user
  if (!email || !password) {
    return next(new ErrorHandler("Masukan Email dan Password", 400));
  }

  // Cek user di database
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Email tidak ditemukan", 401));
  }

  // Cek password di database
  const PasswordMatched = await user.comparePassword(password);

  if (!PasswordMatched) {
    return next(new ErrorHandler("Password salah", 401));
  }
  // jika password sesuai
  sendToken(user, 200, res);

  // const token = user.getJwtToken();

  // res.status(200).json({
  //   success: true,
  //   token,
  // });
});

// User Profile
exports.userProfile = catchError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  // req.user.id diambil dari auth middleware yang sudah terlog di server
  // setelah token user di verifikasi, seluruh data user dapat diakses

  res.status(200).json({
    success: true,
    user,
  });
});

// Update profile
exports.updateProfile = catchError(async (req, res, next) => {
  // cek yang akan diupdate
  const newUserData = {
    nama: req.body.nama,
    email: req.body.email,
  };

  // Update Avatar
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const image_id = user.avatar.public_id;
    const res = await cloudinary.v2.uploader.destroy(image_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "Avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  // update
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

// Update user password
exports.updatePassword = catchError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  // cek old password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Password tidak sesuai", 400));
  } else {
    user.password = req.body.password;

    await user.save();

    sendToken(user, 200, res);
  }
});

// Lupa password / Forgot password
exports.forgotPassword = catchError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("Email tidak terdaftar", 404));
  }

  //reset TOKEN
  const resetToken = user.ResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // url untuk reset password
  // aktifkan jika blm ke frontend
  const urlReset = `${req.protocol}://${req.get("host")}/reset/${resetToken}`;

  // const urlReset = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

  // Pesan email untuk reset password / reset password URL
  const message = `Klik link dibawah ini unutk mereset password anda:\n\n${urlReset}\n\nAbaikan jika anda tidak mereset password`;
  // Notifikasi email berhasil dikirim / successful sending email notification
  const success = `terkirim ke ${user.email} cek spam jika tidak ada di inbox`;

  // mengirim Email untuk reset password
  try {
    // jika bersahil mengirim email
    await sendEmail({
      email: user.email,
      subject: "TOSERBA reset password",
      message,
    });

    res.status(200).json({
      success: true,
      message: success,
    });
  } catch (error) {
    // jika gagal merest password / password reset fail
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password
exports.resetPassword = catchError(async (req, res, next) => {
  // Hash token dari forgtPassword
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Cek user dengan resetPassword yang telah di Hash / user checking
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  // cek jika user tidak ditemukan / not found user
  if (!user) {
    return next(
      new ErrorHandler("Password reset token tidak valid atau kaladuarsa", 400)
    );
  }

  // Jika user ditemukan maka konfirmasi password / found user
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password tidak sama", 400));
  } else {
    //update password baru ke database / password updates in database
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  }
});

// Logout User
exports.logoutUser = catchError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    htppOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout Berhasil",
  });
});

// Route Admin
//Get all Users
exports.allusers = catchError(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    success: true,
    user,
  });
});

// Get users' detail
exports.userDetail = catchError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("user tidak ditemukan", 404));
  } else {
    res.status(200).json({
      success: true,
      user,
    });
  }
});

// Delete user
exports.deleteUser = catchError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User tidak ditemukan", 404));
  } else {
    await user.remove();
    res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
    });
  }
});

// Update user
exports.updateUser = catchError(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User tidak ditemukan", 404));
  } else {
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  }
});
