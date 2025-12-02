import fs from "fs";
import path from "path";
import {
  corsOrigin,
  handleEJSResponse,
  handleError,
  handleExit,
  handleResponse,
  multerHandleError,
  noRouteResponse,
} from "./appFunctions.js";

const initApp = (language, answers, __dirname) => {
  const { projectName, folderName, viewEngine, database, tools } = answers;

  const createProjectStructure = () => {
    // create folder structure
    fs.mkdirSync(`${folderName}/src`);
    fs.mkdirSync(`${folderName}/src/controllers`);
    fs.mkdirSync(`${folderName}/src/models`);
    fs.mkdirSync(`${folderName}/src/routes`);
    fs.mkdirSync(`${folderName}/src/middlewares`);
    fs.mkdirSync(`${folderName}/src/views`);
    fs.mkdirSync(`${folderName}/src/public`);
    fs.mkdirSync(`${folderName}/src/utils`);
    fs.mkdirSync(`${folderName}/src/config`);
    fs.mkdirSync(`${folderName}/src/logs`);

    if (database == "mysql_sequelize") fs.mkdirSync(`${folderName}/src/seeders`);
    if (tools.includes("jest")) fs.mkdirSync(`${folderName}/src/tests`);
  };

  const createTsConfig = () => {
    fs.writeFileSync(
      `${folderName}/tsconfig.json`,
      JSON.stringify(
        {
          compilerOptions: {
            target: "es6",
            module: "commonjs",
            resolveJsonModule: true,
            rootDir: "./src",
            outDir: "./dist",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
          },
          include: ["src/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2
      )
    );
  };

  const createEnv = () => {
    let envContent = [`PORT=3000`, `NODE_ENV=development`];
    envContent.push(`\nDB_HOST=127.0.0.1`);

    if (database == "mysql_sequelize") {
      envContent.push(`DB_CONNECTION=mysql`);
    }
    if (["mysql", "mysql_sequelize"].includes(database)) {
      envContent.push(`DB_PORT=3306`);
      envContent.push(`DB_DATABASE=`);
      envContent.push(`DB_USERNAME=`);
      envContent.push(`DB_PASSWORD=`);
    }

    if (database == "mongoose") {
      envContent.push(`DB_URI=`);
    }

    if (tools.includes("nodemailer")) {
      envContent.push(`\nMAIL_HOST=smtp.gmail.com`);
      envContent.push(`MAIL_PORT=587`);
      envContent.push(`MAIL_USERNAME=<your_mail_address>`);
      envContent.push(`MAIL_PASSWORD=<your_mail_password>`);
    }

    fs.writeFileSync(`${folderName}/.env`, envContent.join("\n"));
    fs.writeFileSync(`${folderName}/.env.example`, envContent.join("\n"));

    if (tools.includes("jest")) fs.writeFileSync(`${folderName}/.env.test`, envContent.join("\n"));
  };

  const createConfig = () => {
    let configContent = {
      appName: projectName,
      rateLimit: {
        maxReq: 100,
        maxMin: 15,
      },
      whiteListOrigins: ["localhost:8080", "localhost:3000"],
      uploadDir: "upload",
    };

    fs.writeFileSync(
      `${folderName}/src/config/app.js`,
      `export default ${JSON.stringify(configContent, null, 2)}`
    );
  };

  const createRoute = () => {
    let routeContent = [
      `import express from "express";`,
      tools.includes("multer") ? `import upload from "../middlewares/multer.js";` : ``,
      `const router = express.Router();\n`,
    ];

    if (tools.includes("swagger")) {
      routeContent.push(
        `/**\n * @swagger\n * /:\n *   get:\n *     summary: Returns a version details\n *     responses:\n *       200:\n *         description: A successful response\n */`
      );
    }
    if (viewEngine) {
      routeContent.push(`router.get("/", ${handleEJSResponse.toString()});\n`);
    } else {
      routeContent.push(`router.get("/", ${handleResponse.toString()});\n`);
    }
    if (tools.includes("multer")) {
      routeContent.push(`// router.post("/user", upload.single("file"), userController.store);`);
    }

    routeContent.push(`router.get(/(.*)/, ${noRouteResponse.toString()});\n`);
    routeContent.push(`export default router;`);

    if (language == "js") {
      fs.writeFileSync(`${folderName}/src/routes/routes.js`, routeContent.join("\n"));
    } else {
      fs.writeFileSync(`${folderName}/src/routes/routes.ts`, routeContent.join("\n"));
    }
  };

  const createProject = () => {
    createProjectStructure();

    if (language == "ts") {
      createTsConfig();
    }

    // create .env
    createEnv();

    // create .gitignore
    fs.writeFileSync(
      `${folderName}/.gitignore`,
      ["/node_modules", ".env", "/src/public/upload"].join("\n")
    );

    // create config file
    createConfig();

    // create route file
    createRoute();

    // copy dist files
    fs.cpSync(
      path.join(__dirname, "dist", "controllers"),
      path.join(folderName, "src", "controllers"),
      {
        recursive: true,
      }
    );

    // copy rate limit middleware
    fs.cpSync(
      path.join(__dirname, "dist", "middlewares/rateLimit.js"),
      path.join(folderName, "src", "middlewares/rateLimit.js")
    );
    fs.cpSync(
      path.join(__dirname, "dist", "utils/logger.js"),
      path.join(folderName, "src", "utils/logger.js")
    );

    if (tools.includes("nodemailer")) {
      fs.cpSync(
        path.join(__dirname, "dist", "utils/mail.js"),
        path.join(folderName, "src", "utils/mail.js")
      );
    }

    if (tools.includes("multer")) {
      fs.cpSync(
        path.join(__dirname, "dist", "middlewares/multer.js"),
        path.join(folderName, "src", "middlewares/multer.js")
      );
    }

    if (viewEngine) {
      fs.cpSync(path.join(__dirname, "dist", "views"), path.join(folderName, "src", "views"), {
        recursive: true,
      });
    }

    if (database == "mysql") {
      fs.cpSync(
        path.join(__dirname, "dist", "config/mysql.database.js"),
        path.join(folderName, "src", "config/database.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "models", "mysql"),
        path.join(folderName, "src", "models"),
        {
          recursive: true,
        }
      );
    }

    if (database == "mongoose") {
      fs.cpSync(
        path.join(__dirname, "dist", "config/mongoose.database.js"),
        path.join(folderName, "src", "config/database.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "models", "mongoose"),
        path.join(folderName, "src", "models"),
        {
          recursive: true,
        }
      );
    }

    if (database == "mysql_sequelize") {
      fs.cpSync(
        path.join(__dirname, "dist", "config/sequelize.database.js"),
        path.join(folderName, "src", "config/database.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "models", "sequelize"),
        path.join(folderName, "src", "models"),
        {
          recursive: true,
        }
      );
      fs.cpSync(path.join(__dirname, "dist", "seeders"), path.join(folderName, "src", "seeders"), {
        recursive: true,
      });
      fs.cpSync(
        path.join(__dirname, "dist", "utils/seeder.js"),
        path.join(folderName, "src", "utils/seeder.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "utils/migrate.js"),
        path.join(folderName, "src", "utils/migrate.js")
      );
    }

    if (tools.includes("swagger")) {
      fs.cpSync(
        path.join(__dirname, "dist", "utils/swagger.js"),
        path.join(folderName, "src", "utils/swagger.js")
      );
    }
    if (tools.includes("jest")) {
      fs.cpSync(
        path.join(__dirname, "dist", "tests/user.test.js"),
        path.join(folderName, "src", "tests/user.test.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "utils/jest.config.js"),
        path.join(folderName, "jest.config.js")
      );

      if (database == "mysql_sequelize") {
        fs.cpSync(
          path.join(__dirname, "dist", "utils/jest.setup.js"),
          path.join(folderName, "jest.setup.js")
        );
      }
    }
  };

  const createApp = () => {
    let appContent = [];

    if (language == "js") {
      appContent.push(`import express from "express";`);
      appContent.push(`import path, { dirname } from "path";`);
      appContent.push(`import config from "./config/app.js";`);
      appContent.push(`import logger from "./utils/logger.js";`);
      appContent.push(`const app = express();`);
      appContent.push(`const port = process.env.PORT || 3000;\n`);

      appContent.push(`import { fileURLToPath } from "url";`);
      appContent.push(`const __filename = fileURLToPath(import.meta.url);`);
      appContent.push(`const __dirname = dirname(__filename);\n`);

      appContent.push(`// setup dotenv`);

      if (tools.includes("jest")) {
        appContent.push(`import dotenv from 'dotenv';`);
        appContent.push(`if (process.env.NODE_ENV == "test") {`);
        appContent.push(`\tdotenv.config({ path: "./.env.test" });`);
        appContent.push(`} else {`);
        appContent.push(`\tdotenv.config({ path: "./.env" });`);
        appContent.push(`}\n`);
      } else {
        appContent.push(`import 'dotenv/config';\n`);
      }

      appContent.push(`// set static public path`);
      appContent.push(`app.use("/public", express.static("public"));\n`);

      if (viewEngine) {
        appContent.push(`// set the view engine to ejs`);
        appContent.push(`app.set('view engine', 'ejs');\n`);

        appContent.push(`// Set the views directory`);
        appContent.push(`app.set('views', path.join(__dirname, 'views'));\n`);
      }

      appContent.push(`// config body parser`);
      appContent.push(`app.use(express.json());`);
      appContent.push(`app.use(express.urlencoded({ extended: true }));\n`);

      appContent.push(`// config cookie parser`);
      appContent.push(`import cookieParser from "cookie-parser";`);
      appContent.push(`app.use(cookieParser());\n`);

      appContent.push(`// config helmet`);
      appContent.push(`import helmet from "helmet";`);
      appContent.push(`app.use(helmet());\n`);

      appContent.push(`// config rate limit`);
      appContent.push(`import rateLimit from "./middlewares/rateLimit.js";`);
      appContent.push(`app.use(rateLimit);\n`);

      appContent.push(`// config cors`);
      appContent.push(`import cors from "cors";`);
      appContent.push(`const corsOptions = { "origin" : ${corsOrigin.toString()}};\n`);

      if (tools.includes("swagger")) {
        appContent.push(`// config swagger`);
        appContent.push(`import { swaggerUi, swaggerSpec } from "./utils/swagger.js";`);
        appContent.push(`app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));\n`);
      }

      appContent.push(`import router from "./routes/routes.js";`);
      appContent.push(`app.use("/", cors(corsOptions), router);\n`);

      // Error handling
      if (tools.includes("multer")) {
        appContent.push(`// Error handling middleware`);
        appContent.push(`import multer from "multer";`);
        appContent.push(`app.use(${multerHandleError.toString()});\n`);
      } else {
        appContent.push(`// Error handling middleware`);
        appContent.push(`app.use(${handleError.toString()});\n`);
      }

      if (database == "mongoose") {
        appContent.push(`// DB conncetion`);
        appContent.push(`import DBConnection from "./config/database.js";`);
        appContent.push(`DBConnection();\n`);
      }

      appContent.push(`process.on("SIGINT", ${handleExit.toString()});\n`);

      if (database == "mysql_sequelize") {
        appContent.push(`import sequelize from "./config/database.js";`);

        appContent.push(`if (process.env.NODE_ENV !== "test") {`);
        appContent.push("\tsequelize.authenticate()");
        appContent.push(
          "\t\t.then(() => app.listen(port, () => logger.info(`Listening on port ${port}...`)))"
        );
        appContent.push(`\t\t.catch((err) => logger.error("DB Connection error:", err));`);
        appContent.push(`}\n`);
      } else {
        appContent.push("app.listen(port, () => logger.info(`Listening on port ${port}...`));\n");
      }

      appContent.push(`export default app;`);
      fs.writeFileSync(`${folderName}/src/app.js`, appContent.join("\n"));
    } else {
      fs.writeFileSync(`${folderName}/src/app.ts`, appContent.join("\n"));
    }
  };

  return { createProject, createApp };
};
export default initApp;
