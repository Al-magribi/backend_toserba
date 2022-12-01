const catchError = require("../middlewares/catchError");
const ErrorHandler = require("../utilities/ErrorHandler");
const Product = require("../models/product");
const Order = require("../models/order");

// Membuat pesanan / creating new order => client
exports.newOrder = catchError(async (req, res, next) => {
  const {
    orderItems,
    detailPengiriman,
    hargaProduk,
    ongkir,
    totalHarga,
    infoPembayaran,
  } = req.body;

  const order = await Order.create({
    orderItems,
    detailPengiriman,
    hargaProduk,
    ongkir,
    totalHarga,
    infoPembayaran,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// detail order / single order => Admin & Client
exports.singlerOrder = catchError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "nama email"
  );
  if (!order) {
    return next(new ErrorHandler("Pesanan tidak ditemukan", 404));
  } else {
    res.status(200).json({
      success: true,
      order,
    });
  }
});

// Menampilkan seluruh pesanan saya / get all my orders => client
exports.myOrders = catchError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get All orders => Admin
exports.getOrders = catchError(async (req, res, next) => {
  const orders = await Order.find();

  let jmlSeluruhHarga = 0;

  orders.forEach((order) => {
    jmlSeluruhHarga += order.totalHarga;
  });

  res.status(200).json({
    success: true,
    jmlSeluruhHarga,
    orders,
  });
});

// delete orders => admin
exports.deleteOrder = catchError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(
        `Pesanan dengan id ${req.params.id} tidak ditemukan`,
        404
      )
    );
  } else {
    await order.remove();
    res.status(200).json({
      success: true,
      message: "Pesanan Berhasil Dihapus",
    });
  }
});

// Update order / procesing to delivered => admin
exports.updateOrder = catchError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  order.orderStatus = req.body.status;
  order.resi = req.body.resi;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order berhasil diperbarui",
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stok = product.stok - quantity;

  await product.save({ validateBeforeSave: false });
}

// Update payment status
exports.updatePayment = catchError(async (req, res) => {
  const order = await Order.findById(req.params.id);

  order.infoPembayaran.status = req.body.status;

  await order.save();

  res.status(200).json({
    success: true,
    message: "Pembanyaran berhasil diupdate",
  });
});
