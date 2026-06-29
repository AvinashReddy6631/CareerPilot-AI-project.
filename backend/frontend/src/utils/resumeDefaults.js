export const TEMPLATES = [
  {
    id: "ATS Standard",
    name: "ATS Standard",
    description: "Clean single-column layout optimized for applicant tracking systems",
    accent: "from-slate-700 to-slate-900",
    badge: "Most popular",
  },
  {
    id: "Professional",
    name: "Professional",
    description: "Classic serif headings for corporate and executive roles",
    accent: "from-brand-600 to-brand-800",
    badge: "Corporate",
  },
  {
    id: "Modern",
    name: "Modern",
    description: "Bold accent sidebar with a contemporary tech aesthetic",
    accent: "from-violet-600 to-indigo-700",
    badge: "Tech",
  },
  {
    id: "Minimal",
    name: "Minimal",
    description: "Ultra-clean whitespace-focused layout with subtle typography",
    accent: "from-slate-500 to-slate-600",
    badge: "Clean",
  },
  {
    id: "Executive",
    name: "Executive",
    description: "Premium two-tone header for senior and leadership roles",
    accent: "from-amber-600 to-slate-800",
    badge: "Premium",
  },
];

export const EMPTY_RESUME = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    jobTitle: "",
  },
  summary: "",
  education: "",
  experience: "",
  projects: "",
  skills: "",
  achievements: "",
  certifications: "",
  responsibilities: "",
  template: "ATS Standard",
};

export function resumeFromApi(resume) {
  return {
    personal: {
      name: resume.name || "",
      email: resume.email || "",
      phone: resume.phone || "",
      location: resume.location || "",
      linkedin: resume.linkedin || "",
      jobTitle: resume.jobTitle || "",
    },
    summary: resume.summary || "",
    education: resume.education || "",
    experience: resume.experience || "",
    projects: resume.projects || "",
    skills: resume.skills || "",
    achievements: resume.achievements || "",
    certifications: resume.certifications || "",
    responsibilities: resume.responsibilities || "",
    template: resume.template || "ATS Standard",
  };
}

export function resumeToApi(data) {
  return {
    name: data.personal.name,
    email: data.personal.email,
    phone: data.personal.phone,
    location: data.personal.location,
    linkedin: data.personal.linkedin,
    jobTitle: data.personal.jobTitle,
    summary: data.summary,
    education: data.education,
    experience: data.experience,
    projects: data.projects,
    skills: data.skills,
    achievements: data.achievements,
    certifications: data.certifications,
    responsibilities: data.responsibilities,
    template: data.template,
  };
}

export function getCompletionPercent(data) {
  const fields = [
    data.personal.name,
    data.personal.email,
    data.summary,
    data.education,
    data.experience,
    data.skills,
  ];
  const filled = fields.filter((f) => f?.trim()).length;
  return Math.round((filled / fields.length) * 100);
}
