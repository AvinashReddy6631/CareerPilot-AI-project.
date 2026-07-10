const ai = require("../config/ai");
const ResumeBuilder = require("../models/ResumeBuilder");
const mongoose = require("mongoose");
const ResumeWorkspace = require("../models/ResumeWorkspace");
const ResumeDraft = require("../models/ResumeDraft");
const ResumeVersion = require("../models/ResumeVersion");
const crypto = require("crypto");

const buildSummaryFallback = (template, skills) => {
  const skillText = skills || "relevant technologies";

  if (template === "Professional") {
    return `Experienced professional with a strong background in ${skillText}. Proven ability to work collaboratively, manage projects, and contribute to organizational success.`;
  }
  if (template === "Modern") {
    return `Creative and innovative professional skilled in ${skillText}. Passionate about building impactful solutions and continuously learning new technologies.`;
  }
  return `Results-driven professional with expertise in ${skillText}. Strong foundation in technical and problem-solving skills with a focus on delivering quality results.`;
};

const resumeFields = [
  "name",
  "email",
  "phone",
  "location",
  "linkedin",
  "jobTitle",
  "skills",
  "education",
  "experience",
  "projects",
  "responsibilities",
  "achievements",
  "certifications",
  "template",
  "summary",
];

const pickResumePayload = (body) =>
  resumeFields.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const normalizeResumePayload = (payload) => ({
  ...payload,
  location: payload.location || "",
  linkedin: payload.linkedin || "",
  jobTitle: payload.jobTitle || "",
  projects: payload.projects || "",
  responsibilities: payload.responsibilities || "",
  achievements: payload.achievements || "",
  certifications: payload.certifications || "",
  template: payload.template || "ATS Standard",
  summary: payload.summary || buildSummaryFallback(payload.template, payload.skills),
});

const getUserId = (req) => req.user?.id || req.user?._id?.toString();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendServerError = (res, error, message = "Resume Builder request failed") => {
  console.error(error);
  return res.status(500).json({
    success: false,
    message: error.message || message,
  });
};

const findResumeForUser = async (resumeId, userId) => {
  if (!isValidObjectId(resumeId)) {
    return { status: 400, message: "Invalid resume id" };
  }

  const resume = await ResumeBuilder.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    return { status: 404, message: "Resume not found" };
  }

  return { resume };
};

const createResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const payload = normalizeResumePayload(pickResumePayload(req.body));

    const resume = await ResumeBuilder.create({
      ...payload,
      user: userId,
    });

    res.status(201).json({
      success: true,
      resume,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to save resume");
  }
};

const generateSummary = async (req, res) => {
  try {
    const {
      name,
      jobTitle,
      skills,
      experience,
      education,
      achievements,
      template,
    } = req.body;

    if (!skills && !experience) {
      return res.status(400).json({
        success: false,
        message: "Add skills or experience to generate a summary",
      });
    }

    try {
      const response = await ai.chat.completions.create({
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: `Write a concise professional resume summary (2-3 sentences, max 60 words).
Tone: ${template === "Modern" ? "creative and energetic" : template === "Professional" ? "formal and executive" : "clear and ATS-friendly"}.
Name: ${name || "Candidate"}
Target role: ${jobTitle || "Professional"}
Skills: ${skills || "N/A"}
Experience: ${experience || "N/A"}
Education: ${education || "N/A"}
Achievements: ${achievements || "N/A"}

Return ONLY the summary text, no quotes or labels.`,
          },
        ],
      });

      const summary =
        response.choices[0].message.content.trim();

      return res.status(200).json({ success: true, summary });
    } catch (aiError) {
      console.error("AI summary fallback:", aiError);
      const summary = buildSummaryFallback(template, skills);
      return res.status(200).json({ success: true, summary, fallback: true });
    }
  } catch (error) {
    return sendServerError(res, error, "Failed to generate summary");
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const resumes = await ResumeBuilder.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select(
        "name email jobTitle template summary createdAt updatedAt"
      );

    res.status(200).json({ success: true, resumes });
  } catch (error) {
    return sendServerError(res, error, "Failed to load resume history");
  }
};

const getLatestResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const resume = await ResumeBuilder.findOne({ user: userId }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    return res.status(200).json({ success: true, resume });
  } catch (error) {
    return sendServerError(res, error, "Failed to load latest resume");
  }
};

const getResumeById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const result = await findResumeForUser(req.params.id, userId);

    if (!result.resume) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({ success: true, resume: result.resume });
  } catch (error) {
    return sendServerError(res, error, "Failed to load resume");
  }
};

const updateResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const result = await findResumeForUser(req.params.id, userId);
    if (!result.resume) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    const payload = normalizeResumePayload({
      ...result.resume.toObject(),
      ...pickResumePayload(req.body),
    });
    delete payload._id;
    delete payload.user;
    delete payload.createdAt;
    delete payload.updatedAt;

    const resume = await ResumeBuilder.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: payload },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, resume });
  } catch (error) {
    return sendServerError(res, error, "Failed to update resume");
  }
};

const deleteResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const result = await findResumeForUser(req.params.id, userId);
    if (!result.resume) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    await ResumeBuilder.findOneAndDelete({ _id: req.params.id, user: userId });

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to delete resume");
  }
};

const EMPTY_RESUME_DATA = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    jobTitle: "",
  },
  summary: "",
  education: "",
  experience: "",
  projects: "",
  skills: "",
  achievements: "",
  certifications: "",
  responsibilities: "",
  template: "ATS Standard",
};

const generateHash = (data) => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

const verifyWorkspace = async (workspaceId, userId, res) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    res.status(400).json({ success: false, message: "Invalid workspace id" });
    return null;
  }
  const workspace = await ResumeWorkspace.findById(workspaceId);
  if (!workspace) {
    res.status(404).json({ success: false, message: "Workspace not found" });
    return null;
  }
  if (workspace.user.toString() !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return null;
  }
  return workspace;
};

const createWorkspace = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { name, jobTitle, template } = req.body;

    const workspace = await ResumeWorkspace.create({
      user: userId,
      name: name?.trim() || "Untitled Resume",
      jobTitle: jobTitle || "",
      template: template || "ATS Standard",
    });

    const draft = await ResumeDraft.create({
      workspace: workspace._id,
      user: userId,
      content: EMPTY_RESUME_DATA,
      contentHash: generateHash(EMPTY_RESUME_DATA),
    });

    res.status(201).json({
      success: true,
      workspace,
      draft,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to create workspace");
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspaces = await ResumeWorkspace.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      workspaces,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch workspaces");
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    res.status(200).json({
      success: true,
      workspace,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch workspace");
  }
};

const renameWorkspace = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Workspace name is required" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    workspace.name = name.trim();
    await workspace.save();

    res.status(200).json({
      success: true,
      workspace,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to rename workspace");
  }
};

const duplicateWorkspace = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    const draft = await ResumeDraft.findOne({ workspace: workspace._id }).lean();
    const content = draft ? draft.content : EMPTY_RESUME_DATA;

    const newWorkspace = await ResumeWorkspace.create({
      user: userId,
      name: `${workspace.name} - Copy`,
      jobTitle: workspace.jobTitle,
      template: workspace.template,
      latestVersion: 0,
    });

    const newDraft = await ResumeDraft.create({
      workspace: newWorkspace._id,
      user: userId,
      content,
      contentHash: draft ? draft.contentHash : generateHash(EMPTY_RESUME_DATA),
    });

    res.status(201).json({
      success: true,
      workspace: newWorkspace,
      draft: newDraft,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to duplicate workspace");
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    await Promise.all([
      ResumeWorkspace.deleteOne({ _id: workspace._id }),
      ResumeDraft.deleteOne({ workspace: workspace._id }),
      ResumeVersion.deleteMany({ workspace: workspace._id }),
    ]);

    res.status(200).json({
      success: true,
      message: "Workspace and associated draft and versions deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to delete workspace");
  }
};

const getDraft = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    let draft = await ResumeDraft.findOne({ workspace: workspace._id });
    if (!draft) {
      draft = await ResumeDraft.create({
        workspace: workspace._id,
        user: userId,
        content: EMPTY_RESUME_DATA,
        contentHash: generateHash(EMPTY_RESUME_DATA),
      });
    }

    res.status(200).json({
      success: true,
      draft,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch draft");
  }
};

const saveDraft = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { content } = req.body;
    if (!content || typeof content !== "object") {
      return res.status(400).json({ success: false, message: "Valid content is required" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    const hash = generateHash(content);
    const draft = await ResumeDraft.findOneAndUpdate(
      { workspace: workspace._id },
      { $set: { content, contentHash: hash } },
      { new: true, upsert: true }
    );

    // Sync metadata with workspace if updated in draft
    const updatedFields = {};
    if (content.personal?.jobTitle !== undefined && content.personal.jobTitle !== workspace.jobTitle) {
      updatedFields.jobTitle = content.personal.jobTitle;
    }
    if (content.template !== undefined && content.template !== workspace.template) {
      updatedFields.template = content.template;
    }
    if (Object.keys(updatedFields).length > 0) {
      await ResumeWorkspace.updateOne({ _id: workspace._id }, { $set: updatedFields });
    }

    res.status(200).json({
      success: true,
      draft,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to save draft");
  }
};

const saveVersion = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { name, content } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Version name is required" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    let contentToFreeze = content;
    if (!contentToFreeze) {
      const draft = await ResumeDraft.findOne({ workspace: workspace._id });
      if (!draft) {
        return res.status(400).json({ success: false, message: "No draft content to freeze" });
      }
      contentToFreeze = draft.content;
    } else if (typeof contentToFreeze !== "object") {
      return res.status(400).json({ success: false, message: "Valid version content is required" });
    }

    workspace.latestVersion += 1;
    await workspace.save();

    const version = await ResumeVersion.create({
      workspace: workspace._id,
      user: userId,
      version: workspace.latestVersion,
      name: name.trim(),
      jobTitle: contentToFreeze.personal?.jobTitle || "",
      template: contentToFreeze.template || "ATS Standard",
      content: contentToFreeze,
      contentHash: generateHash(contentToFreeze),
    });

    res.status(201).json({
      success: true,
      version,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to save version");
  }
};

const getVersionHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    const versions = await ResumeVersion.find({ workspace: workspace._id })
      .sort({ version: -1 })
      .lean();

    res.status(200).json({
      success: true,
      versions,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch version history");
  }
};

const getVersionById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    const { versionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(versionId)) {
      return res.status(400).json({ success: false, message: "Invalid version id" });
    }

    const version = await ResumeVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    if (version.workspace.toString() !== workspace._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      version,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch version");
  }
};

const restoreVersion = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    const { versionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(versionId)) {
      return res.status(400).json({ success: false, message: "Invalid version id" });
    }

    const version = await ResumeVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    if (version.workspace.toString() !== workspace._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const draft = await ResumeDraft.findOneAndUpdate(
      { workspace: workspace._id },
      { $set: { content: version.content, contentHash: version.contentHash } },
      { new: true }
    );

    // Sync metadata
    await ResumeWorkspace.updateOne(
      { _id: workspace._id },
      { $set: { jobTitle: version.jobTitle, template: version.template } }
    );

    res.status(200).json({
      success: true,
      draft,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to restore version");
  }
};

const deleteVersion = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const workspace = await verifyWorkspace(req.params.id, userId, res);
    if (!workspace) return;

    const { versionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(versionId)) {
      return res.status(400).json({ success: false, message: "Invalid version id" });
    }

    const version = await ResumeVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    if (version.workspace.toString() !== workspace._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await ResumeVersion.deleteOne({ _id: version._id });

    res.status(200).json({
      success: true,
      message: "Version deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to delete version");
  }
};

module.exports = {
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
};

