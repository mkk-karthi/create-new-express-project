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
  const { projectName, viewEngine, database, tools } = answers;

  const createProjectStructure = () => {
    // create folder structure
    fs.mkdirSync(`${projectName}/src`);
    fs.mkdirSync(`${projectName}/src/controllers`);
    fs.mkdirSync(`${projectName}/src/models`);
    fs.mkdirSync(`${projectName}/src/routes`);
    fs.mkdirSync(`${projectName}/src/middlewares`);
    fs.mkdirSync(`${projectName}/src/views`);
    fs.mkdirSync(`${projectName}/src/public`);
    fs.mkdirSync(`${projectName}/src/utils`);
    fs.mkdirSync(`${projectName}/src/config`);

    if (database == "mysql_sequelize") fs.mkdirSync(`${projectName}/src/seeders`);
  };

  const createTsConfig = () => {
    fs.writeFileSync(
      `${projectName}/tsconfig.json`,
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
    let envContent = [`PORT=3000`, `NODE_ENV=DEVELOPMENT`];
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

    fs.writeFileSync(`${projectName}/.env`, envContent.join("\n"));
    fs.writeFileSync(`${projectName}/.env.example`, envContent.join("\n"));
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
      `${projectName}/src/config/app.js`,
      `export default ${JSON.stringify(configContent, null, 2)}`
    );
  };

  const createRoute = () => {
    let routeContent = [
      `import express from "express";`,
      tools.includes("multer") ? `import upload from "../middlewares/multer.js";` : ``,
      `const router = express.Router();\n`,
    ];

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
      fs.writeFileSync(`${projectName}/src/routes/routes.js`, routeContent.join("\n"));
    } else {
      fs.writeFileSync(`${projectName}/src/routes/routes.ts`, routeContent.join("\n"));
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
      `${projectName}/.gitignore`,
      ["/node_modules", ".env", "/src/public/upload"].join("\n")
    );

    // create config file
    createConfig();

    // create route file
    createRoute();

    // copy dist files
    fs.cpSync(
      path.join(__dirname, "dist", "controllers"),
      path.join(projectName, "src", "controllers"),
      {
        recursive: true,
      }
    );

    // copy rate limit middleware
    fs.cpSync(
      path.join(__dirname, "dist", "middlewares/rateLimit.js"),
      path.join(projectName, "src", "middlewares/rateLimit.js")
    );

    if (tools.includes("nodemailer")) {
      fs.cpSync(
        path.join(__dirname, "dist", "utils/mail.js"),
        path.join(projectName, "src", "utils/mail.js")
      );
    }

    if (tools.includes("multer")) {
      fs.cpSync(
        path.join(__dirname, "dist", "middlewares/multer.js"),
        path.join(projectName, "src", "middlewares/multer.js")
      );
    }

    if (viewEngine) {
      fs.cpSync(path.join(__dirname, "dist", "views"), path.join(projectName, "src", "views"), {
        recursive: true,
      });
    }

    if (database == "mysql") {
      fs.cpSync(
        path.join(__dirname, "dist", "config/mysql.database.js"),
        path.join(projectName, "src", "config/database.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "models", "mysql"),
        path.join(projectName, "src", "models"),
        {
          recursive: true,
        }
      );
    }

    if (database == "mongoose") {
      fs.cpSync(
        path.join(__dirname, "dist", "config/mongoose.database.js"),
        path.join(projectName, "src", "config/database.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "models", "mongoose"),
        path.join(projectName, "src", "models"),
        {
          recursive: true,
        }
      );
    }

    if (database == "mysql_sequelize") {
      fs.cpSync(
        path.join(__dirname, "dist", "config/sequelize.database.js"),
        path.join(projectName, "src", "config/database.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "models", "sequelize"),
        path.join(projectName, "src", "models"),
        {
          recursive: true,
        }
      );
      fs.cpSync(path.join(__dirname, "dist", "seeders"), path.join(projectName, "src", "seeders"), {
        recursive: true,
      });
      fs.cpSync(
        path.join(__dirname, "dist", "utils/seeder.js"),
        path.join(projectName, "src", "utils/seeder.js")
      );
      fs.cpSync(
        path.join(__dirname, "dist", "utils/migrate.js"),
        path.join(projectName, "src", "utils/migrate.js")
      );
    }
  };

  const createApp = () => {
    let appContent = [];

    if (language == "js") {
      appContent.push(`import express from "express";`);
      appContent.push(`import path, { dirname } from "path";`);
      appContent.push(`import config from "./config/app.js";`);
      appContent.push(`const app = express();`);
      appContent.push(`const port = process.env.PORT || 3000;\n`);

      appContent.push(`import { fileURLToPath } from "url";`);
      appContent.push(`const __filename = fileURLToPath(import.meta.url);`);
      appContent.push(`const __dirname = dirname(__filename);\n`);

      appContent.push(`// setup dotenv`);
      appContent.push(`import 'dotenv/config';\n`);

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

      if (database == "mysql_sequelize") {
        appContent.push(`import sequelize from "./config/database.js";`);

        appContent.push(`sequelize.sync().then(() => {`);
        appContent.push("\tapp.listen(port, () => console.log(`Listening on port ${port}...`));");
        appContent.push(`});`);
      } else {
        appContent.push("app.listen(port, () => console.log(`Listening on port ${port}...`));");
      }

      appContent.push(`process.on("SIGINT", ${handleExit.toString()});`);
      fs.writeFileSync(`${projectName}/src/app.js`, appContent.join("\n"));
    } else {
      fs.writeFileSync(`${projectName}/src/app.ts`, appContent.join("\n"));
    }
  };

  return { createProject, createApp };
};
export default initApp;
