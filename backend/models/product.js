const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, "Masukan nama produk"],
  },
  harga: {
    type: Number,
    required: [true, "Masukan harga produk"],
    default: 0,
  },
  deskripsi: {
    type: String,
    required: [true, "Masukan deskirpsi produk"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  gambar: [
    {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
  ],
  kategori: {
    type: String,
    required: [true, "Pilih kategori produk"],
    enum: {
      values: [
        "Electronics",
        "Cameras",
        "Laptops",
        "Accessories",
        "Headphones",
        "Food",
        "Books",
        "Clothes/Shoes",
        "Beauty/Health",
        "Sports",
        "Outdoor",
        "Home",
        "Others",
      ],
    },
  },
  penjual: {
    type: String,
    required: [true, "Masukan penjual produk"],
  },
  stok: {
    type: Number,
    required: [true, "Masukan stok produk"],
    default: 0,
  },
  berat: {
    type: Number,
    required: [true, "masukan berat produk"],
  },
  jmlReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },

  dibuat: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
