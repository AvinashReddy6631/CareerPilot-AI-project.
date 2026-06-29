const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// Allowed MIME types
const ALLOWED_MIMETYPES = [
  "application/pdf",
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [".pdf"];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  return (
    crypto
      .randomBytes(16)
      .toString("hex") +
    path.extname(filename).toLowerCase()
  );
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure destination is always upload directory
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // Use random filename to prevent path traversal
    const safeFilename =
      sanitizeFilename(
        file.originalname
      );
    cb(null, safeFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file at a time
  },
  fileFilter: (
    req,
    file,
    cb
  ) => {
    // Check MIME type
    if (
      !ALLOWED_MIMETYPES.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Invalid file type. Only PDF files are allowed"
        ),
        false
      );
    }

    // Check file extension
    const ext = path
      .extname(file.originalname)
      .toLowerCase();
    if (
      !ALLOWED_EXTENSIONS.includes(
        ext
      )
    ) {
      return cb(
        new Error(
          "Invalid file extension. Only .pdf files are allowed"
        ),
        false
      );
    }

    // Check if user is authenticated (for rate limiting)
    if (!req.user) {
      return cb(
        new Error(
          "Authentication required for uploads"
        ),
        false
      );
    }

    cb(null, true);
  },
});

module.exports = upload;
