const InterviewHistory = require(
  "../models/InterviewHistory"
);

const saveInterview = async (
  req,
  res
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const {
      role,
      averageScore,
      strengths,
      weaknesses,
      recommendations,
      recommendation,
      averageCommunication,
      averageConfidence,
      grade,
      summary,
    } = req.body;

    const interview =
      await InterviewHistory.create({
        user: req.user?._id || undefined,

        role,
        averageScore,
        strengths,
        weaknesses,
        recommendations:
          recommendations ||
          (recommendation ? [recommendation] : []),
        recommendation:
          recommendation ||
          (recommendations?.[0] ?? ""),
        averageCommunication,
        averageConfidence,
        grade,
        summary,
      });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAnalytics = async (
  req,
  res
) => {
  try {
    const interviews =
      await InterviewHistory.find();

    const totalInterviews =
      interviews.length;

    const averageScore =
      totalInterviews > 0
        ? (
            interviews.reduce(
              (sum, item) =>
                sum +
                item.averageScore,
              0
            ) / totalInterviews
          ).toFixed(1)
        : 0;

    const highestScore =
      totalInterviews > 0
        ? Math.max(
            ...interviews.map(
              (item) =>
                item.averageScore
            )
          )
        : 0;

    res.json({
      success: true,
      totalInterviews,
      averageScore,
      highestScore,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  saveInterview,
  getAnalytics,
};