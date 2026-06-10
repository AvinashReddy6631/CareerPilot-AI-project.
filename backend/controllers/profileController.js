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

    // Validate required name field
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    // Fetch fresh user from DB to avoid stale data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update all provided fields
    user.name = name.trim();
    user.phone = phone ? phone.trim() : "";
    user.college = college ? college.trim() : "";
    user.degree = degree ? degree.trim() : "";
    user.branch = branch ? branch.trim() : "";
    user.graduationYear = graduationYear ? String(graduationYear).trim() : "";
    user.targetRole = targetRole ? targetRole.trim() : "";
    
    // Handle skills - always parse as string from frontend, convert to array
    if (skills !== undefined && skills !== null) {
      user.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : String(skills)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    
    user.linkedinUrl = linkedinUrl ? linkedinUrl.trim() : "";
    user.githubUrl = githubUrl ? githubUrl.trim() : "";
    user.portfolioUrl = portfolioUrl ? portfolioUrl.trim() : "";
    user.profilePicture = profilePicture || "";

    // Recompute profile completion based on actual saved fields
    user.profileCompletion = computeProfileCompletion(user);
    
    // Save and return full updated user
    const savedUser = await user.save();

    res.json({
      success: true,
      user: sanitizeUser(savedUser),
      missingFields: getMissingFields(savedUser),
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: error.message });
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
