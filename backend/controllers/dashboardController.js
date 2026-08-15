const ResumeBuilder = require(
  "../models/ResumeBuilder"
);
const ResumeWorkspace = require(
  "../models/ResumeWorkspace"
);

const Interview = require(
  "../models/Interview"
);

const InterviewHistory = require(
  "../models/InterviewHistory"
);

const Resume = require(
  "../models/Resume"
);

const RoadmapHistory = require(
  "../models/RoadmapHistory"
);

const JobApplication = require(
  "../models/JobApplication"
);

const User = require(
  "../models/User"
);

const MAX_ACTIVITY_ITEMS = 20;

const toActivity = ({
  id,
  type,
  title,
  detail,
  occurredAt,
}) => ({
  id: `${type}-${id}`,
  type,
  title,
  detail,
  occurredAt,
});

const getAnalytics = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const migratedResumeIds = await ResumeWorkspace.find({ user: userId }).distinct(
      "legacyResumeId"
    );

    const [
      workspacesCount,
      legacyCount,
      interviews,
      atsRecords,
      applicationsSent,
    ] = await Promise.all([
      ResumeWorkspace.countDocuments({ user: userId }),
      ResumeBuilder.countDocuments({
        user: userId,
        _id: { $nin: migratedResumeIds },
      }),
      Interview.find({ user: userId }).select("score").lean(),
      Resume.find({ user: userId }).select("atsScore").lean(),
      JobApplication.countDocuments({
        user: userId,
        status: { $ne: "saved" },
      }),
    ]);

    const resumesBuilt = workspacesCount + legacyCount;

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

    const atsAverageScore =
      atsRecords.length > 0
        ? Math.round(
            atsRecords.reduce((sum, r) => sum + (r.atsScore || 0), 0) / atsRecords.length
          )
        : 0;

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

const getActivity = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const [
      resumes,
      atsRecords,
      interviewCoachRecords,
      mockInterviewRecords,
      roadmaps,
      applications,
      profile,
    ] = await Promise.all([
      ResumeBuilder.find({ user: userId })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(8)
        .select("name jobTitle template updatedAt createdAt")
        .lean(),
      Resume.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("fileName atsScore createdAt updatedAt")
        .lean(),
      Interview.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("role score createdAt updatedAt")
        .lean(),
      InterviewHistory.find({ user: userId })
        .sort({ interviewDate: -1, createdAt: -1 })
        .limit(8)
        .select("role averageScore grade interviewDate createdAt updatedAt")
        .lean(),
      RoadmapHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("role stagesCount estimatedMonths createdAt updatedAt")
        .lean(),
      JobApplication.find({ user: userId })
        .sort({ updatedAt: -1, appliedAt: -1, createdAt: -1 })
        .limit(8)
        .select("company role status appliedAt createdAt updatedAt")
        .lean(),
      User.findOne({ _id: userId })
        .select("name profileCompletion createdAt updatedAt")
        .lean(),
    ]);

    const activities = [
      ...resumes.map((resume) =>
        toActivity({
          id: resume._id,
          type: "resume",
          title: "Resume Builder activity",
          detail: `${resume.template || "Resume"}${resume.jobTitle ? ` — ${resume.jobTitle}` : resume.name ? ` — ${resume.name}` : ""}`,
          occurredAt: resume.updatedAt || resume.createdAt,
        })
      ),
      ...atsRecords.map((record) =>
        toActivity({
          id: record._id,
          type: "ats",
          title: "ATS analysis completed",
          detail: `${record.fileName || "Resume"}${Number.isFinite(record.atsScore) ? ` — ${record.atsScore}% ATS score` : ""}`,
          occurredAt: record.createdAt || record.updatedAt,
        })
      ),
      ...interviewCoachRecords.map((record) =>
        toActivity({
          id: record._id,
          type: "interview",
          title: "Interview Coach activity",
          detail: `${record.role || "Interview practice"} — scored ${record.score || 0}/10`,
          occurredAt: record.createdAt || record.updatedAt,
        })
      ),
      ...mockInterviewRecords.map((record) =>
        toActivity({
          id: record._id,
          type: "mock",
          title: "Mock interview completed",
          detail: `${record.role || "Mock interview"} — average ${record.averageScore || 0}/10${record.grade ? ` (${record.grade})` : ""}`,
          occurredAt: record.interviewDate || record.createdAt || record.updatedAt,
        })
      ),
      ...roadmaps.map((roadmap) =>
        toActivity({
          id: roadmap._id,
          type: "roadmap",
          title: "Career roadmap generated",
          detail: `${roadmap.role || "Career roadmap"}${roadmap.estimatedMonths ? ` — ${roadmap.estimatedMonths}-month plan` : ""}`,
          occurredAt: roadmap.createdAt || roadmap.updatedAt,
        })
      ),
      ...applications.map((application) =>
        toActivity({
          id: application._id,
          type: "application",
          title: "Job application activity",
          detail: `${application.role || "Role"} at ${application.company || "Company"} — ${application.status || "applied"}`,
          occurredAt: application.updatedAt || application.appliedAt || application.createdAt,
        })
      ),
    ];

    if (
      profile?.updatedAt &&
      profile?.createdAt &&
      profile.updatedAt.getTime() - profile.createdAt.getTime() > 1000
    ) {
      activities.push(
        toActivity({
          id: profile._id,
          type: "profile",
          title: "Profile updated",
          detail: `${profile.name || "Your profile"}${profile.profileCompletion ? ` — ${profile.profileCompletion}% complete` : ""}`,
          occurredAt: profile.updatedAt,
        })
      );
    }

    activities.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() -
        new Date(a.occurredAt).getTime()
    );

    res.json({
      success: true,
      activities: activities.slice(
        0,
        MAX_ACTIVITY_ITEMS
      ),
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
  getActivity,
};
