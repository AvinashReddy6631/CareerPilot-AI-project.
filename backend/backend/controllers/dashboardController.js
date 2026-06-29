const ResumeBuilder = require("../models/ResumeBuilder");
const Interview = require("../models/Interview");

const getAnalytics = async (req, res) => {
try {
const resumesBuilt = await ResumeBuilder.countDocuments({
user: req.user.id,
});


const interviews = await Interview.find({
  user: req.user.id,
});

const interviewsTaken = interviews.length;

const averageScore =
  interviewsTaken > 0
    ? (
        interviews.reduce(
          (sum, item) => sum + item.score,
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

res.json({
  resumesBuilt,
  interviewsTaken,
  averageScore,
  bestScore,
});


} catch (error) {
console.error(error);


res.status(500).json({
  success: false,
  message: error.message,
});


}
};

module.exports = {
getAnalytics,
};
