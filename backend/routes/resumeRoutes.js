const express = require("express");

const router =
  express.Router();

const upload = require(
  "../middleware/uploadMiddleware"
);

const { optionalAuth } = require(
  "../middleware/optionalAuthMiddleware"
);

const {
  analyzeResume,
} = require(
  "../controllers/resumeController"
);

router.post(
  "/upload",
  optionalAuth,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  },
  analyzeResume
);

module.exports = router;