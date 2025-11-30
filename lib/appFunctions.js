const corsOrigin = (origin, callback) => {
  if (config.whiteListOrigins && config.whiteListOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

let multerHandleError = (err, req, res) => {
  // multer error
  if (err instanceof multer.MulterError || err.message == "MULTER_INVALID_FILE_TYPE") {
    console.error("File Upload error.");
  } else {
    console.error("Express error:", err);
  }
};

let handleError = (err, req, res) => {
  console.error("Express error:", err);
};

let handleExit = () => {
  console.log("Process ended!");
  process.exit(0); // Exit gracefully after cleanup
};

// router
let handleEJSResponse = (req, res) => {
  res.render("welcome", { version: process.version });
};
let handleResponse = (req, res) => {
  res.send("Node version " + process.version);
};
export {
  corsOrigin,
  multerHandleError,
  handleError,
  handleExit,
  handleEJSResponse,
  handleResponse,
};
