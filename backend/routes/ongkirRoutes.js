const express = require("express");
const {
  getAllProvinces,
  getAllCities,
  getCost,
} = require("../controller/ongkirController");
const router = express.Router();

router.route("/provinsi").get(getAllProvinces);
router.route("/kota/:id").get(getAllCities);
router.route("/ongkos/:asal/:tujuan/:berat/:kurir").get(getCost);

module.exports = router;
