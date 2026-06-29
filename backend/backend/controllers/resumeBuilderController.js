const ai = require("../config/ai");
const ResumeBuilder = require("../models/ResumeBuilder");

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

const createResume = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      linkedin,
      jobTitle,
      skills,
      education,
      experience,
      projects,
      responsibilities,
      achievements,
      certifications,
      template,
      summary,
    } = req.body;

    const resume = await ResumeBuilder.create({
      user: req.user._id,
      name,
      email,
      phone,
      location: location || "",
      linkedin: linkedin || "",
      jobTitle: jobTitle || "",
      skills,
      education,
      experience,
      projects: projects || "",
      responsibilities: responsibilities || "",
      achievements: achievements || "",
      certifications: certifications || "",
      template: template || "ATS Standard",
      summary:
        summary ||
        buildSummaryFallback(template, skills),
    });

    res.status(201).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
      console.log("AI summary fallback:", aiError.message);
      const summary = buildSummaryFallback(template, skills);
      return res.status(200).json({ success: true, summary, fallback: true });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const resumes = await ResumeBuilder.find({
  user: req.user._id,
})
      .sort({ createdAt: -1 })
      .limit(20)
      .select(
        "name email jobTitle template summary createdAt updatedAt"
      );

    res.status(200).json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await ResumeBuilder.findOne({
  _id: req.params.id,
  user: req.user._id,
});

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createResume,
  generateSummary,
  getHistory,
  getResumeById,
};
