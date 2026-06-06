const express = require("express");
const {
  search,
  matchJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require("../controllers/jobController");

const router = express.Router();

router.get("/search", search);
router.post("/search", search);
router.post("/match", matchJob);
router.post("/saved", saveJob);
router.get("/saved", getSavedJobs);
router.delete("/saved/:id", removeSavedJob);

module.exports = router;
