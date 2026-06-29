import FormSection from "./FormSection";
import { ResumeInput, ResumeTextarea } from "./ResumeField";
import TemplatePicker from "./TemplatePicker";
import AiActionButton from "./AiActionButton";

const icons = {
  user: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8l7-4 7 4-7 4-7-4z" strokeLinejoin="round" />
      <path d="M6 10v4c0 1 2.5 2 4 2s4-1 4-2v-4" />
    </svg>
  ),
  work: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="14" height="10" rx="2" />
      <path d="M7 7V5.5a2 2 0 012-2h2a2 2 0 012 2V7" />
    </svg>
  ),
  project: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6l7-3 7 3v8l-7 3-7-3V6z" strokeLinejoin="round" />
    </svg>
  ),
  skill: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.5L10 14.5 5.1 17.2l.9-5.5-4-3.9 5.5-.8L10 2z" strokeLinejoin="round" />
    </svg>
  ),
  award: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="9" r="4" />
      <path d="M7.5 13L6 18l4-2 4 2-1.5-5" strokeLinejoin="round" />
    </svg>
  ),
  cert: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="3" width="12" height="14" rx="2" />
      <path d="M8 8h4M8 11h4" strokeLinecap="round" />
    </svg>
  ),
  leadership: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 14l4-8 4 5 4-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  template: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 8h14" />
    </svg>
  ),
};

export default function ResumeForm({
  data,
  onPersonalChange,
  onFieldChange,
  onTemplateChange,
  onGenerateSummary,
  onGenerateBullets,
  summaryLoading,
  bulletLoading,
  bulletField,
}) {
  return (
    <div className="space-y-3 pb-8">
      <FormSection
        title="ATS Templates"
        description="Pick a layout — switch anytime without losing content"
        icon={icons.template}
        badge="5 templates"
      >
        <TemplatePicker selected={data.template} onSelect={onTemplateChange} />
      </FormSection>

      <FormSection
        title="Personal Information"
        description="Name, contact details, and professional headline"
        icon={icons.user}
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ResumeInput label="Full Name" name="name" value={data.personal.name} onChange={onPersonalChange} placeholder="Alex Johnson" required />
          <ResumeInput label="Job Title" name="jobTitle" value={data.personal.jobTitle} onChange={onPersonalChange} placeholder="Frontend Developer" />
          <ResumeInput label="Email" name="email" type="email" value={data.personal.email} onChange={onPersonalChange} placeholder="alex@email.com" required />
          <ResumeInput label="Phone" name="phone" value={data.personal.phone} onChange={onPersonalChange} placeholder="+91 98765 43210" required />
          <ResumeInput label="Location" name="location" value={data.personal.location} onChange={onPersonalChange} placeholder="Bangalore, India" />
          <ResumeInput label="LinkedIn" name="linkedin" value={data.personal.linkedin} onChange={onPersonalChange} placeholder="linkedin.com/in/alexjohnson" />
        </div>

        <ResumeTextarea
          label="Professional Summary"
          name="summary"
          value={data.summary}
          onChange={onFieldChange}
          placeholder="A compelling 2–3 sentence overview of your experience, skills, and career goals…"
          rows={3}
          actions={
            <AiActionButton onClick={onGenerateSummary} loading={summaryLoading} compact />
          }
        />
      </FormSection>

      <FormSection title="Education" description="Degrees, institutions, GPA, and honors" icon={icons.education}>
        <ResumeTextarea
          label="Education"
          name="education"
          value={data.education}
          onChange={onFieldChange}
          placeholder={"B.Tech Computer Science — IIT Delhi (2022–2026)\nCGPA: 8.7/10 · Relevant coursework: DSA, OS, DBMS"}
          rows={4}
        />
      </FormSection>

      <FormSection title="Experience" description="Internships, jobs, and professional roles" icon={icons.work}>
        <ResumeTextarea
          label="Experience"
          name="experience"
          value={data.experience}
          onChange={onFieldChange}
          placeholder={"Software Engineering Intern — TechCorp (Jun 2025 – Aug 2025)\nBuilt React dashboards used by 10K+ users\nReduced API latency by 35%"}
          rows={5}
          actions={
            <AiActionButton
              onClick={() => onGenerateBullets("experience")}
              loading={bulletLoading && bulletField === "experience"}
              label="AI Bullets"
              compact
            />
          }
        />
      </FormSection>

      <FormSection title="Projects" description="Personal, academic, or open-source work" icon={icons.project}>
        <ResumeTextarea
          label="Projects"
          name="projects"
          value={data.projects}
          onChange={onFieldChange}
          placeholder={"CareerPilot AI — Full-stack career assistant\nReact, Node.js, MongoDB, OpenRouter AI"}
          rows={4}
          actions={
            <AiActionButton
              onClick={() => onGenerateBullets("projects")}
              loading={bulletLoading && bulletField === "projects"}
              label="AI Bullets"
              compact
            />
          }
        />
      </FormSection>

      <FormSection title="Skills" description="Technical and soft skills — comma or line separated" icon={icons.skill}>
        <ResumeTextarea
          label="Skills"
          name="skills"
          value={data.skills}
          onChange={onFieldChange}
          placeholder="JavaScript, React, Node.js, MongoDB, Git, REST APIs, Problem Solving, Communication"
          rows={3}
        />
      </FormSection>

      <FormSection title="Certifications" description="Professional certs, courses, and licenses" icon={icons.cert}>
        <ResumeTextarea
          label="Certifications"
          name="certifications"
          value={data.certifications}
          onChange={onFieldChange}
          placeholder={"AWS Cloud Practitioner — Amazon (2025)\nMeta Front-End Developer — Coursera (2024)"}
          rows={3}
        />
      </FormSection>

      <FormSection title="Achievements" description="Awards, hackathons, publications, and impact" icon={icons.award}>
        <ResumeTextarea
          label="Achievements"
          name="achievements"
          value={data.achievements}
          onChange={onFieldChange}
          placeholder={"Winner — Smart India Hackathon 2025\nPublished NLP research at IEEE conference"}
          rows={3}
          actions={
            <AiActionButton
              onClick={() => onGenerateBullets("achievements")}
              loading={bulletLoading && bulletField === "achievements"}
              label="AI Bullets"
              compact
            />
          }
        />
      </FormSection>

      <FormSection
        title="Positions of Responsibility"
        description="Leadership roles, club positions, and campus involvement"
        icon={icons.leadership}
      >
        <ResumeTextarea
          label="Positions of Responsibility"
          name="responsibilities"
          value={data.responsibilities}
          onChange={onFieldChange}
          placeholder={"Technical Head — Coding Club, IIT Delhi (2024–2025)\nOrganized 3 hackathons with 500+ participants\nMentored 40+ juniors in DSA and web development"}
          rows={4}
          actions={
            <AiActionButton
              onClick={() => onGenerateBullets("responsibilities")}
              loading={bulletLoading && bulletField === "responsibilities"}
              label="AI Bullets"
              compact
            />
          }
        />
      </FormSection>
    </div>
  );
}
