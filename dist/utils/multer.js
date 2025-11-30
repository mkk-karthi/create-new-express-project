import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join("src", "public", "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
// const storage = multer.memoryStorage();  // Memory storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Validate the file extensions (optional)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif|mp4|gif|pdf|doc|docx/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error("MULTER_INVALID_FILE_TYPE"), false);
//   }
// };

// Config multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Set Max file size limit (EX: 10MB)
  },
  // fileFilter,
});

export default upload;
