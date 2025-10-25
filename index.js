#!/usr/bin/env node

import fs from "fs";
import inquirer from "inquirer";
import { updateProgressBar } from "./lib/common.js";
import initApp from "./lib/file.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        value: "express",
      },
      {
        name: "joi",
        value: "joi",
      },
    ],
    default: false,
  },
];

// const questions1 = [
//   {
//     type: "confirm",
//     name: "haveDatabase",
//     message: "Do you have Database?",
//     default: false,
//   },
//   {
//     type: "list",
//     name: "database",
//     message: "Select Database:",
//     choices: [
//       {
//         name: "MySQL",
//         value: "mysql",
//       },
//       {
//         name: "MongoDB",
//         value: "mongo",
//       },
//     ],
//     default: "mysql",
//     when: (ans) => ans.haveDatabase,
//   },
//   {
//     type: "confirm",
//     name: "logger",
//     message: "Do you have Logger (winston)?",
//     default: false,
//   },
//   {
//     type: "confirm",
//     name: "testingTool",
//     message: "Do you have Testing tool (jest)?",
//     default: false,
//   },
// ];

const projectName = process.argv[2];
if (!projectName) {
  questions.unshift({
    type: "input",
    name: "projectName",
    message: "Project Name:",
    default: "my-express-app",
  });
}

const run = async () => {
  const answers = await inquirer.prompt(questions);

  if (!projectName) {
    projectName = answers.projectName;
  } else {
    answers.projectName = projectName;
  }
  const language = "js";

  if (!fs.existsSync(projectName)) {
    console.log("\n");
    const init = initApp(language, answers, __dirname);
    updateProgressBar("Initializing...");

    // create folder structure
    init.createProjectStructure();

    updateProgressBar("Creating package.json...");
    // creating package.json
    await init.createPackage();

    updateProgressBar("Creating project setup...");
    init.createProject();

    updateProgressBar("Completed!");

    console.log("\nProject created successfully!\n");
    console.log("Next Steps:");
    console.log(`1. cd ${projectName}/`);
    console.log("2. npm install");
    console.log("3. npm run dev");
    console.log("\nEnjoy!\n");
  } else {
    console.log(`\n${projectName} folder already exist\n`);
  }
};

run();

process.on("SIGINT", () => {
  console.log("Thank you");
  process.exit(0); // Exit gracefully after cleanup
});

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("Thank you");
    process.exit(0); // Exit gracefully after cleanup
  } else {
    console.error(error);
  }
});
