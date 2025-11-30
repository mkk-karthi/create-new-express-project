import "dotenv/config";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).split("/").slice(0, -1).join("/");

const basename = path.basename(__filename);
const seedersDir = path.join(__dirname, "seeders");

const files = fs.readdirSync(seedersDir).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".js") && // .js files only
    !file.endsWith(".test.js") // exclude *test.js
  );
});

for (const file of files) {
  const modulePath = path.join(seedersDir, file);

  // Dynamic import in ES modules
  const seeder = await import(modulePath);

  // If default export is a function, call it
  if (typeof seeder.default === "function") {
    seeder
      .default()
      .then(() => console.log(modulePath,"\t\t\tDone"))
      .catch((err) => {
        console.error(modulePath,"\t\t\tError\n")
        console.error("DB seeder error:", err);
        process.exit(1);
      });
  }
}
