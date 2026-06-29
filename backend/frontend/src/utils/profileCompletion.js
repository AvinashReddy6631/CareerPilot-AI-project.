export const PROFILE_FIELDS = [
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

export const computeProfileCompletion = (user) => {
  if (!user) return 0;
  const filled = PROFILE_FIELDS.filter((f) => isFieldFilled(user, f)).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

export const getMissingFields = (user) => {
  if (!user) return PROFILE_FIELDS.map((f) => f.label);
  return PROFILE_FIELDS.filter((f) => !isFieldFilled(user, f)).map((f) => f.label);
};

export const getInitials = (name) => {
  if (!name?.trim()) return "CP";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};
