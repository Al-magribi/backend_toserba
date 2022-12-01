const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  detailPengiriman: {
    provinsi: {
      type: String,
      required: false,
    },
    kota: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    kodePos: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "product",
      },
    },
  ],
  infoPembayaran: {
    order_id: {
      type: String,
    },
    id: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
  },

  hargaProduk: {
    type: Number,
    required: true,
    default: 0,
  },
  ongkir: {
    type: Number,
    required: true,
    default: 0,
  },
  totalHarga: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  resi: {
    type: String,
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
