import dotenv from "dotenv";
import { Sequelize } from "sequelize";

if (process.env.NODE_ENV == "test") {
  dotenv.config({ path: "./.env.test" });
} else {
  dotenv.config({ path: "./.env" });
}

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_CONNECTION,
    logging: false,
  }
);

export default sequelize;
