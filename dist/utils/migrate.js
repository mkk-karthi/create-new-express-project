import "dotenv/config";
import fs from "fs";
import path from "path";
import sequelize from "../config/database.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).split("/").slice(0,-1).join("/");
const basename = path.basename(__filename);

const models = {};

const modelFiles = fs.readdirSync(path.join(__dirname, "models")).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".js") &&
    !file.endsWith(".test.js")
  );
});

for (const file of modelFiles) {
  const { default: model } = await import(path.join(__dirname, "models", file));
  models[model.name] = model;
}

(async () => {
  if (process.argv.slice(2).includes("refresh")) {
    await sequelize
      .sync({ force: true })
      .then(() => console.log("Migration completed!"))
      .catch((err) => console.error("Migration error:", err));
  } else {
    await sequelize
      .sync({ alter: true })
      .then(() => console.log("Migration completed!"))
      .catch((err) => console.error("Migration error:", err));
  }
  process.exit();
})();
