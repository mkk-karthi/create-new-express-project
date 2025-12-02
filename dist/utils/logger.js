import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const dailyRotateFileConfig = {
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
};

const errorLog = new DailyRotateFile({
  ...dailyRotateFileConfig,
  filename: "error-%DATE%.log",
  dirname: "src/logs",
  level: "error",
});
errorLog.on("rotate", function (oldFilename, newFilename) {
  // upload to cloud / s3
});

const appLog = new DailyRotateFile({
  ...dailyRotateFileConfig,
  filename: "log-%DATE%.log",
  dirname: "src/logs",
});

const logger = createLogger({
  level: process.env.NODE_ENV == "production" ? "info" : "debug",
  format: format.combine(format.timestamp(), format.json()),
  transports: [errorLog, appLog],
});

if (process.env.NODE_ENV != "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;
