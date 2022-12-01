const express = require("express");
const {
  newOrder,
  singlerOrder,
  myOrders,
  getOrders,
  deleteOrder,
  updateOrder,
  updatePayment,
} = require("../controller/orderController");
const { authenticatedUser, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

// membuat pesanan baru / creating new order
router.route("/pesanan/baru").post(authenticatedUser, newOrder);
// detail order
router.route("/order/:id").get(authenticatedUser, singlerOrder);
// pesanan saya / my orders
router.route("/orders/me").get(authenticatedUser, myOrders);

// admin section
// all orders => admin
router
  .route("/admin/orders")
  .get(authenticatedUser, authorizeRoles("admin"), getOrders);
// delete order => admin
router
  .route("/admin/order/:id")
  .delete(authenticatedUser, authorizeRoles("admin"), deleteOrder);

// Genreal section
// Update order processing to delivered
router.route("/admin/order/update/:id").put(authenticatedUser, updateOrder);
router.route("/payment/status/:id").put(authenticatedUser, updatePayment);

module.exports = router;
