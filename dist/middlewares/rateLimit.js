import rateLimit from "express-rate-limit";
import config from "../config/app.js";

export default rateLimit({
	windowMs: config.rateLimit.maxMin * 60 * 1000,
	max: config.rateLimit.maxReq,
	message: "Too Many Requests"
});