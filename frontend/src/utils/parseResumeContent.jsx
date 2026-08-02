/* eslint-disable react-refresh/only-export-components */

export function parseLines(content) {
  if (!content?.trim()) return [];
  return content.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function isBulletLine(line) {
  return /^[•\-*]\s+/.test(line);
}

export function isHeaderLine(line) {
  return !isBulletLine(line) && (
    line.includes("—") || line.includes("–") || line.includes("|") || /\b(19|20)\d{2}\b/.test(line)
  );
}

export function normalizeUrl(value) {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function cleanBullet(line) {
  return line.replace(/^[•\-*]\s*/, "").trim();
}

export function parseResumeEntries(content) {
  const entries = [];
  let current = null;

  parseLines(content).forEach((line) => {
    if (isHeaderLine(line)) {
      if (current) entries.push(current);
      current = { heading: line, bullets: [], prose: [] };
      return;
    }

    if (!current) current = { heading: "", bullets: [], prose: [] };

    if (isBulletLine(line) || current.heading) {
      current.bullets.push(cleanBullet(line));
    } else {
      current.prose.push(line);
    }
  });

  if (current && (current.heading || current.bullets.length || current.prose.length)) entries.push(current);
  return entries;
}

const SKILL_CATEGORIES = [
  ["Languages", /^(javascript|typescript|python|java|c\+\+|c#|c|go|golang|rust|kotlin|swift|php|ruby|scala|r|sql|html|css|sass|scss)$/i],
  ["Frontend", /(react|next\.?js|vue|angular|redux|tailwind|bootstrap|webpack|vite|html|css|sass|figma)/i],
  ["Backend", /(node\.?js|express|nestjs|django|flask|fastapi|spring|laravel|graphql|rest|microservice)/i],
  ["Database", /(mongodb|postgres|mysql|sqlite|redis|dynamodb|firebase|supabase|oracle|elasticsearch)/i],
  ["Cloud", /(aws|azure|gcp|google cloud|docker|kubernetes|terraform|vercel|netlify|cloudflare)/i],
  ["Tools", /(git|github|gitlab|jira|postman|linux|npm|yarn|pnpm|jenkins|github actions|ci\/cd)/i],
  ["Core Subjects", /(data structures|algorithms|dbms|operating systems|computer networks|oop|object oriented|system design|distributed systems)/i],
  ["Frameworks", /(react native|flutter|electron|tensorflow|pytorch|scikit|pandas|numpy|socket\.io)/i],
  ["AI/ML", /(machine learning|deep learning|nlp|llm|generative ai|openai|langchain|computer vision|tensorflow|pytorch)/i],
];

export function categorizeSkills(skills) {
  const categories = new Map();
  const uncategorized = [];
  const items = (skills || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);

  items.forEach((skill) => {
    const match = SKILL_CATEGORIES.find(([, expression]) => expression.test(skill));
    if (!match) {
      uncategorized.push(skill);
      return;
    }
    const [category] = match;
    categories.set(category, [...(categories.get(category) || []), skill]);
  });

  if (uncategorized.length) categories.set("Additional", uncategorized);
  return Array.from(categories, ([label, itemsInCategory]) => ({ label, items: itemsInCategory }));
}

export function getCodingProfiles(personal = {}) {
  return [
    ["LinkedIn", personal.linkedin],
    ["GitHub", personal.github],
    ["Portfolio", personal.portfolio],
    ["LeetCode", personal.leetcode],
    ["HackerRank", personal.hackerrank],
    ["CodeChef", personal.codechef],
  ]
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => ({ label, value: value.trim(), url: normalizeUrl(value) }));
}

export function getContactItems(personal = {}) {
  return [
    personal.phone && { label: personal.phone, url: `tel:${personal.phone.replace(/\s/g, "")}` },
    personal.email && { label: personal.email, url: `mailto:${personal.email}` },
    personal.location && { label: personal.location, url: "" },
    personal.linkedin && { label: personal.linkedin, url: normalizeUrl(personal.linkedin) },
    personal.github && { label: personal.github, url: normalizeUrl(personal.github) },
    personal.portfolio && { label: personal.portfolio, url: normalizeUrl(personal.portfolio) },
  ].filter(Boolean);
}

export function getResumeTheme(template) {
  const serif = template === "Professional" || template === "Executive";
  return {
    cssFont: serif ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif",
    pdfFont: serif ? "times" : "helvetica",
    docxFont: serif ? "Times New Roman" : "Arial",
    nameWeight: template === "Minimal" ? 600 : 700,
    headingTracking: template === "Modern" ? "0.12em" : "0.06em",
  };
}

export function buildResumeDocument(data) {
  const sections = [
    { title: "Professional Summary", kind: "summary", content: data.summary },
    { title: "Education", kind: "entries", content: data.education },
    { title: "Technical Skills", kind: "skills", content: data.skills },
    { title: "Experience", kind: "entries", content: data.experience },
    { title: "Projects", kind: "entries", content: data.projects },
    { title: "Achievements", kind: "entries", content: data.achievements },
    { title: "Certifications", kind: "entries", content: data.certifications },
    { title: "Coding Profiles", kind: "profiles", content: getCodingProfiles(data.personal) },
    { title: "Positions of Responsibility", kind: "entries", content: data.responsibilities },
  ];

  return {
    personal: data.personal || {},
    template: data.template || "ATS Standard",
    theme: getResumeTheme(data.template),
    contacts: getContactItems(data.personal),
    sections: sections
      .map((section) => ({
        ...section,
        entries: section.kind === "entries" ? parseResumeEntries(section.content) : [],
        categories: section.kind === "skills" ? categorizeSkills(section.content) : [],
      }))
      .filter((section) => {
        if (section.kind === "profiles") return section.content.length > 0;
        if (section.kind === "skills") return section.categories.length > 0;
        return section.content?.trim();
      }),
  };
}

export function BulletList({ lines, className = "" }) {
  const bullets = lines.filter((line) => isBulletLine(line) || (!isHeaderLine(line) && line.length > 0));
  if (!bullets.length) return null;

  return (
    <ul className={`space-y-1 ${className}`}>
      {bullets.map((line, index) => (
        <li key={index} className="flex gap-2 text-[10.5pt] leading-[1.35] text-slate-800">
          <span className="mt-[0.48em] shrink-0">•</span>
          <span>{cleanBullet(line)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ContentBlock({ content, bulletClass = "" }) {
  const entries = parseResumeEntries(content);
  if (!entries.length) return null;

  return (
    <div className="space-y-2.5">
      {entries.map((entry, index) => (
        <div key={`${entry.heading}-${index}`}>
          {entry.heading && <p className="font-bold text-slate-950">{entry.heading}</p>}
          {entry.prose.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          <BulletList lines={entry.bullets} className={bulletClass} />
        </div>
      ))}
    </div>
  );
}

export function PreviewSection({ title, content, children }) {
  if (!content?.trim() && !children) return null;
  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 border-b border-slate-900 pb-1 text-[12pt] font-bold uppercase leading-none tracking-wide text-slate-950">{title}</h3>
      {children || <ContentBlock content={content} />}
    </section>
  );
}
