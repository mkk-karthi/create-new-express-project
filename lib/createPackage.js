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
  const { projectName, folderName, viewEngine, validator, database, tools } = answers;

  // creating package.json
  let packages = [
    "express",
    "cors",
    "dotenv",
    "cookie-parser",
    "helmet",
    "express-rate-limit",
    "winston",
    "winston-daily-rotate-file",
  ];
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
  if (tools.includes("jest")) devPackages.push("jest", "supertest");
  if (tools.includes("swagger")) packages.push("swagger-jsdoc", "swagger-ui-express");

  // create scripts
  if (language == "js") {
    scripts = {
      start: "NODE_ENV=production node src/app.js",
      dev: "npx nodemon src/app.js",
    };

    if (tools.includes("jest")) {
      scripts = {
        ...scripts,
        test: "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules npx jest --detectOpenHandles",
        "test:coverage": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules npx jest --coverage",
      };
    }

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
      start: "NODE_ENV=production node dist/app.js",
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
  fs.writeFileSync(`${folderName}/package.json`, JSON.stringify(packageContent, null, 2));
  return;
};
export default createPackageJSON;
