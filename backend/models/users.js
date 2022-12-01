const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, "Masukan nama anda"],
  },
  email: {
    type: String,
    require: [true, "Masukan email anda"],
    unique: true,
    validate: [validator.isEmail, "Masukan email yang valid"],
  },
  password: {
    type: String,
    required: [true, "Masukan password"],
    minlength: [6, "minimal password 6 karakter"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  dibuat: {
    type: Date,
    default: Date.now,
  },
  //Mereset password user jika user lupa
  resetPasswordToken: String,
  //Masa aktif link untuk mereset password
  resetPasswordExpire: Date,
});
//Mengenkripsi password sebelum di save ke database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Membandingkan password yang di input user dengan databse
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generate JSON WEB TOKEN
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Generate TOKEN in Reseting Password
userSchema.methods.ResetPasswordToken = function () {
  //Generate TOKEN
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash and Set Reset Password
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set TOKEN Expires
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("user", userSchema);
