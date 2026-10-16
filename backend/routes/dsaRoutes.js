const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getDsaModule,
  updateDsaProgress,
} = require("../controllers/dsaController");

const router = express.Router();

router.use(protect);
router.get("/", getDsaModule);
router.put("/progress/:topicId", updateDsaProgress);

module.exports = router;
