import { execSync } from "child_process";
import https from "https";
import http from "http";
import url from "url";

// Function to get the latest version of an npm package
export const getLatestVersion = async (packageName) => {
  try {
    // get supported pacakge vesion
    const data = await callApi("get", "https://registry.npmjs.org/react");

    let versions = Object.keys(data.versions).reverse(); // newest first

    let nodeVersion = execSync(`node -v`).toString().trim();

    for (const version of versions) {
      const _nodeVersion = data.versions[version]._nodeVersion;
      if (_nodeVersion && _nodeVersion.startsWith(nodeVersion) && /^\d+(\.\d+){0,2}$/.test(v)) {
        return { name: packageName, version: `^${version}` };
      }
    }
  } catch (e) {}

  // any error or not found return latest version
  const latestVersion = execSync(`npm show ${packageName} version`).toString().trim();
  return { name: packageName, version: `^${latestVersion}` };
};

export const callApi = (method, apiUrl, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(apiUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: method.toUpperCase(),
      port: parsedUrl.port || (isHttps ? 443 : 80),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = lib.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const contentType = res.headers["content-type"] || "";
          if (contentType.includes("application/json")) {
            resolve(JSON.parse(body));
          } else {
            resolve(body);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const totalSteps = 4;
let currentStep = 0;
let lastStep = null;
let spinnerInterval = null;
const tickIcon = "\x1b[32m✔\x1b[0m";
const spinnerFrames = ["|", "/", "-", "\\"];

export const updateProgressBar = (stepName) => {
  currentStep++;
  if (spinnerInterval) clearInterval(spinnerInterval);

  if (lastStep) {
    // Move cursor up one line
    process.stdout.write("\x1b[1A"); // Move up
    process.stdout.write("\x1b[2K"); // Clear the entire line
    process.stdout.write(`${tickIcon} ${lastStep}\n`);
  }

  if (totalSteps == currentStep) {
    process.stdout.write(`${tickIcon} ${stepName}\n`);
  } else {
    lastStep = stepName;
    let spinnerIndex = 0;
    process.stdout.write(`${spinnerFrames[0]} ${stepName}\n`);
    spinnerInterval = setInterval(() => {
      // Move up and clear line
      process.stdout.write("\x1b[1A");
      process.stdout.write("\x1b[2K");

      // Show the spinner with the current step
      const spinner = spinnerFrames[spinnerIndex % spinnerFrames.length];
      process.stdout.write(`${spinner} ${stepName}\n`);
      spinnerIndex++;
    }, 100);
  }
}
