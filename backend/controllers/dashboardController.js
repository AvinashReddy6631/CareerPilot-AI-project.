const ResumeBuilder = require(
  "../models/ResumeBuilder"
);

const Interview = require(
  "../models/Interview"
);

const JobApplication = require(
  "../models/JobApplication"
);

const getAnalytics = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const resumesBuilt =
      await ResumeBuilder.countDocuments({
        userId
      });

    const interviews =
      await Interview.find({
        userId
      });

    const interviewsTaken =
      interviews.length;

    const averageScore =
      interviewsTaken > 0
        ? (
            interviews.reduce(
              (sum, item) =>
                sum + (item.score || 0),
              0
            ) / interviewsTaken
          ).toFixed(1)
        : 0;

    const bestScore =
      interviewsTaken > 0
        ? Math.max(
            ...interviews.map(
              (i) => i.score || 0
            )
          )
        : 0;

    const applicationsSent =
      await JobApplication.countDocuments({
        clientId: userId,
        status: "applied"
      });

    res.json({
      success: true,
      resumesBuilt,
      interviewsTaken,
      averageScore,
      bestScore,
      applicationsSent,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAnalytics,
};
