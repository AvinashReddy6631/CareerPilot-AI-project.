const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  createResume,
  generateSummary,
  getHistory,
  getLatestResume,
  getResumeById,
  updateResume,
  deleteResume,
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  renameWorkspace,
  duplicateWorkspace,
  deleteWorkspace,
  getDraft,
  saveDraft,
  saveVersion,
  getVersionHistory,
  getVersionById,
  restoreVersion,
  deleteVersion,
} = require("../controllers/resumeBuilderController");

router.use(protect);

// Legacy ResumeBuilder Routes (Backward Compatibility)
router.post("/create", createResume);
router.post("/generate-summary", generateSummary);
router.get("/history", getHistory);
router.get("/latest", getLatestResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.get("/:id", getResumeById);

// Workspace Routes
router.post("/workspaces", createWorkspace);
router.get("/workspaces", getWorkspaces);
router.get("/workspaces/:id", getWorkspaceById);
router.put("/workspaces/:id/rename", renameWorkspace);
router.post("/workspaces/:id/duplicate", duplicateWorkspace);
router.delete("/workspaces/:id", deleteWorkspace);

// Draft Routes
router.get("/workspaces/:id/draft", getDraft);
router.put("/workspaces/:id/draft", saveDraft);

// Version Routes
router.post("/workspaces/:id/versions", saveVersion);
router.get("/workspaces/:id/versions", getVersionHistory);
router.get("/workspaces/:id/versions/:versionId", getVersionById);
router.post("/workspaces/:id/versions/:versionId/restore", restoreVersion);
router.delete("/workspaces/:id/versions/:versionId", deleteVersion);

module.exports = router;

