const DsaProgress = require("../models/DsaProgress");
const {
  DSA_TOPICS,
  isSafeResourceUrl,
  getTotalConfiguredResources,
} = require("../config/dsaTopics");

const topicIds = new Set(DSA_TOPICS.map((topic) => topic.id));

const serializeTopic = (topic, progress) => ({
  id: topic.id,
  name: topic.name,
  description: topic.description,
  difficulty: topic.difficulty,
  estimatedTime: topic.estimatedTime,
  youtubeUrl: isSafeResourceUrl(topic.youtubeUrl) ? topic.youtubeUrl : null,
  practiceUrl: isSafeResourceUrl(topic.practiceUrl) ? topic.practiceUrl : null,
  notes: topic.notes || "",
  additionalResources: (topic.additionalResources || [])
    .filter((resource) => isSafeResourceUrl(resource?.url))
    .map((resource) => ({
      label: resource.label || "Additional resource",
      url: resource.url,
    })),
  completed: Boolean(progress?.completed),
  lastUpdated: progress?.updatedAt || null,
});

const getSummary = async (userId) => {
  const completedTopics = await DsaProgress.countDocuments({
    user: userId,
    topicId: { $in: [...topicIds] },
    completed: true,
  });
  const totalTopics = DSA_TOPICS.length;

  return {
    totalTopics,
    completedTopics,
    totalResources: getTotalConfiguredResources(),
    completionPercentage: totalTopics
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0,
  };
};

const getDsaModule = async (req, res) => {
  try {
    const progressRows = await DsaProgress.find({ user: req.user._id }).lean();
    const progressByTopic = new Map(
      progressRows.map((progress) => [progress.topicId, progress])
    );

    return res.json({
      success: true,
      topics: DSA_TOPICS.map((topic) =>
        serializeTopic(topic, progressByTopic.get(topic.id))
      ),
      summary: await getSummary(req.user._id),
    });
  } catch (error) {
    console.error("Unable to load DSA module:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load DSA learning progress. Please try again.",
    });
  }
};

const updateDsaProgress = async (req, res) => {
  const topicId = String(req.params.topicId || "");
  const { completed } = req.body || {};

  if (!topicIds.has(topicId)) {
    return res.status(404).json({
      success: false,
      message: "DSA topic not found.",
    });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "completed must be a boolean.",
    });
  }

  try {
    let progress = await DsaProgress.findOneAndUpdate(
      { user: req.user._id, topicId },
      {
        $set: { completed },
        $setOnInsert: { user: req.user._id, topicId },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        returnDocument: "after",
      }
    );

    if (!progress) {
      progress = await DsaProgress.findOne({ user: req.user._id, topicId });
    }

    const topic = DSA_TOPICS.find((item) => item.id === topicId);
    return res.json({
      success: true,
      topic: serializeTopic(topic, progress),
      summary: await getSummary(req.user._id),
    });
  } catch (error) {
    if (error?.code === 11000) {
      const progress = await DsaProgress.findOneAndUpdate(
        { user: req.user._id, topicId },
        { $set: { completed } },
        { runValidators: true, returnDocument: "after" }
      );
      const topic = DSA_TOPICS.find((item) => item.id === topicId);

      return res.json({
        success: true,
        topic: serializeTopic(topic, progress),
        summary: await getSummary(req.user._id),
      });
    }

    console.error("Unable to update DSA progress:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update DSA progress. Please try again.",
    });
  }
};

module.exports = {
  getDsaModule,
  updateDsaProgress,
};
