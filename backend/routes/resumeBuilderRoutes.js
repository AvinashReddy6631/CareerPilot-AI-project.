const express = require("express");

const router = express.Router();

const {
  createResume,
} = require(
  "../controllers/resumeBuilderController"
);

router.post(
  "/create",
  createResume
);

module.exports = router;