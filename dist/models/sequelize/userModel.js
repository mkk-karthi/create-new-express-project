import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const userModel = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    defaultScope: {
      attributes: ["id", "name", "email"],
      order: ["id"],
      limit: 10,
    },
  }
);

export default userModel;