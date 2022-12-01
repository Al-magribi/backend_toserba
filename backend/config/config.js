require("dotenv").config();
const mongoose = require("mongoose");

const dbonnection = async (req, res) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`tersambung ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = dbonnection;
