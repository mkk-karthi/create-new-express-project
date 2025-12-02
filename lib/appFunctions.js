const corsOrigin = (origin, callback) => {
  if (config.whiteListOrigins && config.whiteListOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

let multerHandleError = (err, req, res, next) => {
  // multer error
  if (err instanceof multer.MulterError) {
    logger.error("File Upload error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      res.send("File size limit exceeded");
    } else if (err.code === "INVALID_FILE_TYPE") {
      res.send("Invalid file type");
    } else {
      res.send("File Upload error");
    }
  } else {
    logger.error("Express error:", err);
    res.send("Server error");
  }
};

let handleError = (err, req, res, next) => {
  logger.error("Express error:", err);
  res.send("Server error");
};

let handleExit = () => {
  logger.info("Process ended!");
  process.exit(); // Exit gracefully after cleanup
};

// router
let handleEJSResponse = (req, res) => {
  res.render("welcome", { version: process.version });
};
let handleResponse = (req, res) => {
  res.send("Node version " + process.version);
};
let noRouteResponse = (req, res) => {
  res.status(404).send("Not found");
};
export {
  corsOrigin,
  multerHandleError,
  handleError,
  handleExit,
  handleEJSResponse,
  handleResponse,
  noRouteResponse,
};
