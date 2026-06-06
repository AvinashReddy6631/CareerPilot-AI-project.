const PROFILE_FIELDS = [
  { key: "name", label: "Full name" },
  { key: "phone", label: "Phone number" },
  { key: "college", label: "College" },
  { key: "degree", label: "Degree" },
  { key: "graduationYear", label: "Graduation year" },
  { key: "targetRole", label: "Target role" },
  { key: "skills", label: "Skills", isArray: true },
  { key: "linkedinUrl", label: "LinkedIn URL" },
  { key: "githubUrl", label: "GitHub URL" },
  { key: "portfolioUrl", label: "Portfolio URL" },
  { key: "profilePicture", label: "Profile picture" },
];

const isFieldFilled = (user, field) => {
  if (field.isArray) {
    return Array.isArray(user.skills) && user.skills.length > 0;
  }
  const value = user[field.key];
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
};

const computeProfileCompletion = (user) => {
  const filled = PROFILE_FIELDS.filter((f) => isFieldFilled(user, f)).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

const getMissingFields = (user) =>
  PROFILE_FIELDS.filter((f) => !isFieldFilled(user, f)).map((f) => f.label);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  college: user.college || "",
  degree: user.degree || "",
  branch: user.branch || "",
  graduationYear: user.graduationYear || "",
  targetRole: user.targetRole || "",
  skills: user.skills || [],
  linkedinUrl: user.linkedinUrl || "",
  githubUrl: user.githubUrl || "",
  portfolioUrl: user.portfolioUrl || "",
  profilePicture: user.profilePicture || "",
  profileCompletion: user.profileCompletion || 0,
  resumeScore: user.resumeScore || 0,
  atsScore: user.atsScore || 0,
  interviewReadiness: user.interviewReadiness || 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = {
  PROFILE_FIELDS,
  computeProfileCompletion,
  getMissingFields,
  sanitizeUser,
};
