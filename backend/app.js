const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

const errorMiddleware = require("./middlewares/errors");

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cookieParser());
app.use(fileUpload());

// All routes
const product = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ongkirRoutes = require("./routes/ongkirRoutes");

app.use("/api/toserba", product);
app.use("/api/toserba", userRoutes);
app.use("/api/toserba", orderRoutes);
app.use("/api/toserba", ongkirRoutes);
app.use("/api/toserba", paymentRoutes);

if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}
// error middleware harus diletakan dibawah routes
app.use(errorMiddleware);

module.exports = app;
