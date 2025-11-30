import fs from "fs";
import packages from "./packages.js";
import { execSync } from "child_process";

const prepareDependencies = async (pkgList) => {
  const deps = {};
  let nodeVersion = process.versions.node.split(".")[0];
  nodeVersion = Math.floor(nodeVersion / 2) * 2; // convert into stable version
  let versionPkgs = packages[nodeVersion] ?? [];

  for (const pkg of pkgList) {
    if (versionPkgs[pkg]) deps[pkg] = versionPkgs[pkg];
    else deps[pkg] = execSync(`npm show ${pkg} version`).toString().trim();
  }

  return deps;
};

const createPackageJSON = async (language, answers) => {
  const { projectName, viewEngine, validator, database, tools } = answers;

  // creating package.json
  let packages = ["express", "cors", "dotenv", "cookie-parser", "helmet", "express-rate-limit"];
  let devPackages = ["nodemon"];
  let scripts = {};

  if (viewEngine) {
    packages.push("ejs");
  }

  if (validator == "joi") {
    packages.push("joi");
  } else if (validator == "express-validator") {
    packages.push("express-validator");
  }

  if (database == "mysql") packages.push("mysql2");
  if (database == "mongoose") packages.push("mongoose");
  if (database == "mysql_sequelize") packages.push("mysql2", "sequelize");

  if (tools.includes("multer")) packages.push("multer");
  if (tools.includes("nodemailer")) packages.push("nodemailer");

  // create scripts
  if (language == "js") {
    scripts = {
      start: "set NODE_ENV=PRODUCTION & node src/app.js",
      dev: "npx nodemon src/app.js",
    };

    if (database == "mysql_sequelize") {
      scripts = {
        ...scripts,
        "db:migrate": "node src/utils/migrate.js",
        "db:refresh": "node src/utils/migrate.js refresh",
        "db:seed": "node src/utils/seeder.js",
      };
    }
  } else {
    scripts = {
      start: "set NODE_ENV=PRODUCTION & node dist/app.js",
      build: "tsc -p .",
      dev: "nodemon dist/app.js",
      watch: "tsc -w",
    };

    // add dev dependencies
    devPackages.push(
      "typescript",
      "ts-node",
      "@types/express",
      "@types/cors",
      "@types/cookie-parser",
      "@types/express-rate-limit",
      "@types/node"
    );

    if (viewEngine) {
      devPackages.push("@types/ejs");
    }
  }

  let dependencies = await prepareDependencies(packages);
  let devDependencies = await prepareDependencies(devPackages);

  // prepare content
  let packageContent = {
    name: projectName,
    version: "1.0.0",
    description: "",
    main: language == "js" ? "src/app.js" : "src/app.ts",
    type: "module",
    scripts,
    keywords: [],
    author: "",
    license: "ISC",
    dependencies,
    devDependencies,
  };
  fs.writeFileSync(`${projectName}/package.json`, JSON.stringify(packageContent, null, 2));
  return;
};
export default createPackageJSON;
