import fs from "fs";
import path from "path";
import { getLatestVersion } from "./common.js";

const initApp = (language, answers, __dirname) => {
  const { projectName, viewEngine, validator } = answers;

  const createProjectStructure = () => {
    // create folder structure
    fs.mkdirSync(projectName);

    fs.mkdirSync(`${projectName}/src`);
    fs.mkdirSync(`${projectName}/src/public`);
    fs.mkdirSync(`${projectName}/src/routes`);
    fs.mkdirSync(`${projectName}/src/models`);
    fs.mkdirSync(`${projectName}/src/controllers`);
    fs.mkdirSync(`${projectName}/src/middlewares`);
    fs.mkdirSync(`${projectName}/src/services`);
    fs.mkdirSync(`${projectName}/src/storage`);
    fs.mkdirSync(`${projectName}/src/config`);
  };

  const createPackage = async () => {
    // creating package.json
    let dependencies = [
      getLatestVersion("express"),
      getLatestVersion("cors"),
      getLatestVersion("dotenv"),
      getLatestVersion("cookie-parser"),
      getLatestVersion("helmet"),
      getLatestVersion("express-rate-limit"),
    ];
    let devDependencies = [getLatestVersion("nodemon")];
    let scripts = {};

    if (viewEngine) {
      dependencies.push(getLatestVersion("ejs"));
    }

    if (validator == "joi") {
      dependencies.push(getLatestVersion("joi"));
      dependencies.push(getLatestVersion("@joi/date"));
    } else if (validator == "express-validator") {
      dependencies.push(getLatestVersion("express-validator"));
    }

    // add scripts
    if (language == "js") {
      scripts = {
        start: "set NODE_ENV=PRODUCTION & node src/app.js",
        dev: "npx nodemon src/app.js",
      };
    } else {
      scripts = {
        start: "set NODE_ENV=PRODUCTION & node dist/app.js",
        build: "tsc -p .",
        dev: "nodemon dist/app.js",
        watch: "tsc -w",
      };

      // add dev dependencies
      devDependencies.push(getLatestVersion("typescript"));
      devDependencies.push(getLatestVersion("ts-node"));
      devDependencies.push(getLatestVersion("@types/express"));
      devDependencies.push(getLatestVersion("@types/cors"));
      devDependencies.push(getLatestVersion("@types/cookie-parser"));
      devDependencies.push(getLatestVersion("@types/express-rate-limit"));
      devDependencies.push(getLatestVersion("@types/node"));

      if (viewEngine) {
        devDependencies.push(getLatestVersion("@types/ejs"));
      }
    }

    let dependenciesPromise = await Promise.all(dependencies);
    let devDependenciesPromise = await Promise.all(devDependencies);

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
      dependencies: JSON.parse(
        "{" +
          dependenciesPromise
            .filter((v) => !!v)
            .map((v) => `"${v.name}" : "${v.version}"`)
            .join(",") +
          "}"
      ),
      devDependencies: JSON.parse(
        "{" + devDependenciesPromise.map((v) => `"${v.name}" : "${v.version}"`).join(",") + "}"
      ),
    };
    fs.writeFileSync(`${projectName}/package.json`, JSON.stringify(packageContent));
    return;
  };

  const createProject = async () => {
    if (language == "ts") {
      createTsConfig();
    }

    // create .env
    createEnv();

    // create config file
    createConfig();

    // create route file
    createRoute();

    // move dist files
    fs.cpSync(
      path.join(__dirname, "dist", "controllers"),
      path.join(projectName, "src", "controllers"),
      {
        recursive: true,
      }
    );
    if (viewEngine) {
      fs.cpSync(path.join(__dirname, "dist", "views"), path.join(projectName, "views"), {
        recursive: true,
      });
    }

    // create app.js
    createApp();
  };

  const createTsConfig = () => {
    fs.writeFileSync(
      `${projectName}/tsconfig.json`,
      JSON.stringify({
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
      })
    );
  };

  const createEnv = () => {
    fs.writeFileSync(`${projectName}/.env`, `PORT=3000\nNODE_ENV=development`);
    fs.writeFileSync(`${projectName}/.env.example`, `PORT=3000\nNODE_ENV=development`);
  };

  const createConfig = () => {
    fs.writeFileSync(
      `${projectName}/src/config/app.js`,
      `export default ${JSON.stringify(
        {
          appName: projectName,
          rateLimit: {
            maxReq: 100,
            maxMin: 15,
          },
          whiteListOrigins: ["localhost:8080", "localhost:3000"],
        },
        null,
        2
      )}`
    );
  };

  const createRoute = () => {
    let routeContent = [];
    let lineBreak = "\n";

    routeContent.push(`import express from "express";`);
    routeContent.push(`const router = express.Router();${lineBreak}`);

    if (viewEngine) {
      routeContent.push(
        `router.get("/", (req, res) => {\n\tres.render("welcome", { version: process.version });\n});${lineBreak}`
      );
    } else {
      routeContent.push(
        `router.get("/", (req, res) => {\n\tres.send("Node version " + process.version);\n});${lineBreak}`
      );
    }
    routeContent.push(`export default router;`);

    if (language == "js") {
      fs.writeFileSync(`${projectName}/src/routes/index.js`, routeContent.join("\n"));
    } else {
      fs.writeFileSync(`${projectName}/src/routes/index.ts`, routeContent.join("\n"));
    }
  };

  const createApp = () => {
    let appContent = [];
    let lineBreak = "\n";

    if (language == "js") {
      let rateLimitContent = `import rateLimit from "express-rate-limit";${lineBreak}`;
      rateLimitContent += `import config from "../config/app.js";${lineBreak}${lineBreak}`;
      rateLimitContent += `export default rateLimit({\n\twindowMs: config.rateLimit.maxMin * 60 * 1000,\n\tmax: config.rateLimit.maxReq,\n\tmessage: "Too Many Requests"\n});`;
      fs.writeFileSync(`${projectName}/src/middlewares/rateLimit.js`, rateLimitContent);
      
      appContent.push(`import express from "express";`);
      appContent.push(`import config from "./config/app.js";`);
      appContent.push(`const app = express();`);
      appContent.push(`const port = process.env.PORT || 3000;${lineBreak}`);

      appContent.push(`// setup dotenv`);
      appContent.push(`import 'dotenv/config';${lineBreak}`);

      appContent.push(`// set static public path`);
      appContent.push(`app.use("/public", express.static("public"));${lineBreak}`);

      if (viewEngine) {
        appContent.push(`// set the view engine to ejs`);
        appContent.push(`app.set('view engine', 'ejs');${lineBreak}`);
      }

      appContent.push(`// config body parser`);
      appContent.push(`app.use(express.json());`);
      appContent.push(`app.use(express.urlencoded({extended: true}));${lineBreak}`);

      appContent.push(`// config cookie parser`);
      appContent.push(`import cookieParser from "cookie-parser";`);
      appContent.push(`app.use(cookieParser());${lineBreak}`);

      appContent.push(`// config helmet`);
      appContent.push(`import helmet from "helmet";`);
      appContent.push(`app.use(helmet());${lineBreak}`);

      appContent.push(`// config rate limit`);
      appContent.push(`import rateLimit from "./middlewares/rateLimit.js";`);
      appContent.push(`app.use(rateLimit);${lineBreak}`);

      appContent.push(`// config cors`);
      appContent.push(`import cors from "cors";`);
      appContent.push(
        `const corsOptions = {\n\torigin: function (origin, callback) {\n\t\tif (config.whiteListOrigins && config.whiteListOrigins.includes(origin)) {\n\t\t\tcallback(null, true);\n\t\t} else {\n\t\t\tcallback(null, false);\n\t\t}\n\t}\n};${lineBreak}`
      );

      appContent.push(`import router from "./routes/index.js";`);
      appContent.push(`app.use("/", cors(corsOptions), router);${lineBreak}`);

      appContent.push("app.listen(port, () => console.log(`Listening on port ${port}...`));");

      appContent.push(
        `process.on("SIGINT", () => {\n\tconsole.log("Thank you");\n\tprocess.exit(0); // Exit gracefully after cleanup\n});`
      );
      fs.writeFileSync(`${projectName}/src/app.js`, appContent.join("\n"));
    } else {
      fs.writeFileSync(`${projectName}/src/app.ts`, appContent.join("\n"));
    }
  };

  return { createProjectStructure, createPackage, createProject };
};
export default initApp;
