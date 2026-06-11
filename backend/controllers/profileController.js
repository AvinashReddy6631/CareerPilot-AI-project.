const User = require("../models/User");
const ResumeBuilder = require("../models/ResumeBuilder");
const Resume = require("../models/Resume");
const InterviewHistory = require("../models/InterviewHistory");
const RoadmapHistory = require("../models/RoadmapHistory");
const JobApplication = require("../models/JobApplication");
const {
  computeProfileCompletion,
  getMissingFields,
  sanitizeUser,
} = require("../utils/profileCompletion");
const {
  validateProfileUpdate,
} = require("../utils/validators");

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: sanitizeUser(user),
      missingFields: getMissingFields(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      college,
      degree,
      branch,
      graduationYear,
      targetRole,
      skills,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      profilePicture,
    } = req.body;

    // Validate profile data
    const validation =
      validateProfileUpdate({
        name,
        phone,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
      });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone?.trim() || "";
    if (college !== undefined) user.college = college?.trim() || "";
    if (degree !== undefined) user.degree = degree?.trim() || "";
    if (branch !== undefined) user.branch = branch?.trim() || "";
    if (graduationYear !== undefined)
      user.graduationYear = String(
        graduationYear
      )
        .trim();
    if (targetRole !== undefined)
      user.targetRole = targetRole?.trim() || "";
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
            .map((s) => String(s).trim())
            .filter(Boolean)
            .slice(0, 50)
        : String(skills)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 50);
    }
    if (linkedinUrl !== undefined)
      user.linkedinUrl = linkedinUrl?.trim() || "";
    if (githubUrl !== undefined)
      user.githubUrl = githubUrl?.trim() || "";
    if (portfolioUrl !== undefined)
      user.portfolioUrl = portfolioUrl?.trim() || "";
    if (profilePicture !== undefined)
      user.profilePicture = profilePicture;

    user.profileCompletion =
      computeProfileCompletion(user);
    await user.save();

    res.json({
      success: true,
      user: sanitizeUser(user),
      missingFields: getMissingFields(user),
      message:
        "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { clientId } = req.query;

    const atsRecords = await Resume.find({ user: userId }).select("atsScore");
    const atsAverageScore =
      atsRecords.length > 0
        ? Math.round(
            atsRecords.reduce((sum, r) => sum + (r.atsScore || 0), 0) / atsRecords.length
          )
        : 0;

    const interviews = await InterviewHistory.find({ user: userId }).select("averageScore");
    const interviewAverageScore =
      interviews.length > 0
        ? parseFloat(
            (
              interviews.reduce((sum, i) => sum + (i.averageScore || 0), 0) / interviews.length
            ).toFixed(1)
          )
        : 0;

    const roadmaps = await RoadmapHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(1);
    const latestRoadmap = roadmaps[0];
    const roadmapProgress = latestRoadmap
      ? Math.min(100, Math.round((latestRoadmap.stagesCount / (latestRoadmap.estimatedMonths || 1)) * 10))
      : 0;

    let applicationsSent = 0;
    if (clientId) {
      const apps = await JobApplication.find({ clientId });
      applicationsSent = apps.filter((a) => a.status !== "saved").length;
    }

    const resumesBuilt = await ResumeBuilder.countDocuments({ user: userId });

    res.json({
      success: true,
      stats: {
        atsAverageScore,
        interviewAverageScore,
        roadmapProgress,
        applicationsSent,
        resumesBuilt,
        interviewsTaken: interviews.length,
        atsScans: atsRecords.length,
        roadmapsGenerated: await RoadmapHistory.countDocuments({ user: userId }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfileHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const [resumes, interviews, atsScans, roadmaps] = await Promise.all([
      ResumeBuilder.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name jobTitle template createdAt"),
      InterviewHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("role averageScore grade interviewDate createdAt"),
      Resume.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("fileName atsScore skills createdAt"),
      RoadmapHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("role stagesCount estimatedMonths jobReadinessMonth milestones createdAt"),
    ]);

    res.json({
      success: true,
      history: { resumes, interviews, atsScans, roadmaps },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getProfileStats,
  getProfileHistory,
};
