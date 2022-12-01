const axios = require("axios");

axios.defaults.baseURL = process.env.PROVINCE_LIST;
axios.defaults.headers.common["key"] = process.env.ONGKIR_KEY;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

// Data semua province
exports.getAllProvinces = (req, res) =>
  axios
    .get("/province")
    .then((response) => res.json(response.data))
    .catch((err) => res.send(err));

// Data kota berdasarkan provinsi
exports.getAllCities = (req, res) => {
  const id = req.params.id;
  axios
    .get(`/city?province=${id}`)
    .then((response) => res.json(response.data))
    .catch((err) => res.send(err));
};

// menghitung ongkir
exports.getCost = (req, res) => {
  const param = req.params;

  axios
    .post("/cost", {
      origin: param.asal,
      destination: param.tujuan,
      weight: param.berat,
      courier: param.kurir,
    })
    .then((response) => res.json(response.data))
    .catch((err) => res.err);
};
