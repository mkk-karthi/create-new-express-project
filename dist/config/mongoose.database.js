import mongoose from "mongoose";
import logger from "../utils/logger.js"

// Mongo DB conncetion
function DbConnect() {
  const db_uri = process.env.DB_URI;

  mongoose
    .connect(db_uri, {
      connectTimeoutMS: 1000,
    })
    .then((res) => logger.info("DB connected"))
    .catch((err) => logger.info(err));
}

export default DbConnect;
