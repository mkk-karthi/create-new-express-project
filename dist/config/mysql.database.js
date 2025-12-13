import mysql from "mysql2";
import logger from "../utils/logger.js"

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  insecureAuth: false,
});

connection.connect((err) => {
  if (err) {
    logger.error("Error connecting to MySQL:", err);
    return;
  }
  logger.info("Connected to MySQL database");
});

export default connection;
