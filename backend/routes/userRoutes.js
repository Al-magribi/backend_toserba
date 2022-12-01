const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  userProfile,
  updatePassword,
  updateProfile,
  allusers,
  userDetail,
  deleteUser,
  updateUser,
} = require("../controller/userController");
const { authenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Registrasi User Baru => Client
router.route("/daftar").post(registerUser);
// Login user => Client & admin
router.route("/login").post(loginUser);
// User profile => Client & admin
router.route("/me").get(authenticatedUser, userProfile);
//Update Profile => Client & admin
router.route("/me/update").put(authenticatedUser, updateProfile);
// update password => Client & admin
router.route("/password/update").put(authenticatedUser, updatePassword);
// Forgot Password => Client & admin
router.route("/forgot").post(forgotPassword);
// Reset Password = Client & admin
router.route("/reset/:token").put(resetPassword);
//Logout user => Client & admin
router.route("/logout").get(logoutUser);
//all Users => admin
router
  .route("/admin/users")
  .get(authenticatedUser, authorizeRoles("admin"), allusers);
// User's detail
router
  .route("/admin/user/:id")
  .get(authenticatedUser, authorizeRoles("admin"), userDetail);
// Delete user=> admin
router
  .route("/admin/user/delete/:id")
  .delete(authenticatedUser, authorizeRoles("admin"), deleteUser);
// Update user
router
  .route("/admin/user/update/:id")
  .put(authenticatedUser, authorizeRoles("admin"), updateUser);

module.exports = router;
