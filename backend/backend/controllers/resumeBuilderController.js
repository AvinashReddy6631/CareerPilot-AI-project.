const ai = require("../config/ai");
const ResumeBuilder = require("../models/ResumeBuilder");
const mongoose = require("mongoose");

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

  const resume = await ResumeBuilder.findById(resumeId);
  if (!resume) {
    return { status: 404, message: "Resume not found" };
  }

  if (resume.user?.toString() !== userId) {
    return { status: 403, message: "You do not have access to this resume" };
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

module.exports = {
  createResume,
  generateSummary,
  getHistory,
  getLatestResume,
  getResumeById,
  updateResume,
  deleteResume,
};
