#!/usr/bin/env node

"use strict";

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { Command } from "commander";
import { generateFolderName, updateProgressBar } from "./lib/common.js";
import initApp from "./lib/initApp.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import createPackageJSON from "./lib/createPackage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleExit = () => {
  console.log("Operation cancelled.");
  process.exit();
};

const handleError = (e) => {
  if (e instanceof Error && e.name === "ExitPromptError") {
    handleExit();
  } else {
    console.error("ERROR! An error was encountered while executing");
    console.error(e);
    process.exit(1);
  }
};

process.on("SIGINT", handleExit);
process.on("uncaughtException", handleError);

// check node version
const nodeVersion = process.versions.node;
const majorVersion = 18;
const [major] = nodeVersion.split(".").map(Number);
if (major < majorVersion) {
  console.error(
    `You are using npm ${nodeVersion}. Requires Node ${majorVersion} or higher. \nPlease update your version of Node.`
  );
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
const run = async () => {
  let projectName;

  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .description("CLI to create Express app in MVC pattern")
    .arguments("<project-name>")
    .usage(`<project-name> [options]`)
    .action((name) => {
      projectName = name;
    });

  const questions = [
    // {
    //   type: "list",
    //   name: "language",
    //   message: "Prefered language:",
    //   choices: [
    //     {
    //       name: "Javascript",
    //       value: "js",
    //     },
    //     {
    //       name: "Typescript",
    //       value: "ts",
    //     },
    //   ],
    //   default: "js",
    // },
    {
      type: "confirm",
      name: "viewEngine",
      message: "Do you have View Engine (ejs)?",
      default: false,
    },
    {
      type: "list",
      name: "validator",
      message: "Do you have Validator?",
      choices: [
        {
          name: "No",
          value: false,
        },
        {
          name: "express-validator",
          value: "express-validator",
        },
        {
          name: "joi",
          value: "joi",
        },
      ],
      default: false,
    },
    {
      type: "list",
      name: "database",
      message: "Do you have Database?",
      choices: [
        {
          name: "No",
          value: false,
        },
        {
          name: "MongoDB",
          value: "mongoose",
        },
        {
          name: "MySQL",
          value: "mysql",
        },
        {
          name: "MySQL + Sequelize",
          value: "mysql_sequelize",
        },
      ],
      default: false,
    },
    {
      name: "tools",
      type: "checkbox",
      message: "Tools:",
      choices: [
        {
          name: "Mail (nodemailer)",
          value: "nodemailer",
        },
        {
          name: "File Upload (multer)",
          value: "multer",
        },
        {
          name: "Api Document (swagger)",
          value: "swagger",
        },
        {
          name: "Testing Tool (jest)",
          value: "jest",
        },
      ],
    },
  ];

  if (!projectName) {
    questions.unshift({
      type: "input",
      name: "projectName",
      message: "Project Name:",
      default: "my-express-app",
    });
  }

  const answers = await inquirer.prompt(questions);

  if (!projectName) {
    projectName = answers.projectName;
  } else {
    answers.projectName = projectName;
  }
  let folderName = generateFolderName(projectName);
  answers.folderName = folderName;

  const language = "js";

  if (!fs.existsSync(folderName)) {
    console.log("\n");
    const init = initApp(language, answers, __dirname);

    updateProgressBar("Initializing...");
    fs.mkdirSync(folderName);

    // creating package.json
    await createPackageJSON(language, answers);

    updateProgressBar("Creating project setup...");
    // create folder structure
    init.createProject();
    init.createApp();

    updateProgressBar("Completed!", true);

    console.log("\nProject created successfully!\n");
    console.log("Next Steps:");
    console.log(`1. cd ${folderName}/`);
    console.log("2. npm install");
    console.log("3. npm run dev");
    console.log("\nEnjoy!\n");
  } else {
    console.log(`\n${folderName} folder already exist\n`);
  }
};

run();
