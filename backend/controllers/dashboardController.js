const ResumeBuilder = require(
  "../models/ResumeBuilder"
);

const Interview = require(
  "../models/Interview"
);

const Resume = require(
  "../models/Resume"
);

const JobApplication = require(
  "../models/JobApplication"
);

const getAnalytics = async (
  req,
  res
) => {
  try {
    const resumesBuilt =
      await ResumeBuilder.countDocuments({ user: req.user.id });

    const interviews =
      await Interview.find({ user: req.user.id });

    const interviewsTaken =
      interviews.length;

    const averageScore =
      interviewsTaken > 0
        ? (
            interviews.reduce(
              (sum, item) =>
                sum + item.score,
              0
            ) / interviewsTaken
          ).toFixed(1)
        : 0;

    const bestScore =
      interviewsTaken > 0
        ? Math.max(
            ...interviews.map(
              (i) => i.score
            )
          )
        : 0;

    const atsRecords = await Resume.find({ user: req.user.id }).select("atsScore");
    const atsAverageScore =
      atsRecords.length > 0
        ? Math.round(
            atsRecords.reduce((sum, r) => sum + (r.atsScore || 0), 0) / atsRecords.length
          )
        : 0;

    const applicationsSent = await JobApplication.countDocuments({
      user: req.user.id,
      status: { $ne: "saved" },
    });

    res.json({
      resumesBuilt,
      interviewsTaken,
      averageScore,
      bestScore,
      atsAverageScore,
      applicationsSent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAnalytics,
};