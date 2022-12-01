require("dotenv").config();
const app = require("./app");
const databaseConnection = require("./config/config");

const cloudinary = require("cloudinary").v2;

process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

// Koneksi database
databaseConnection();

app.get("/", (req, res) => {
  res.send("Server ok");
});

// konfigurasi cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const port = 2000;
app.listen(process.env.PORT || port, () => {
  console.log(
    `Server aktif di port ${process.env.PORT}${port} dimode ${process.env.NODE_ENV}`
  );
});
