import { motion, AnimatePresence } from "framer-motion";
import PreviewEmptyState from "./PreviewEmptyState";
import TemplateSwitcher from "./TemplateSwitcher";
import { PreviewSection } from "../../utils/parseResumeContent";

function SkillsTags({ skills, variant = "default" }) {
  if (!skills?.trim()) return null;
  const items = skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

  const tagClass = {
    default: "bg-slate-100 text-slate-700",
    modern: "bg-violet-100 text-violet-800",
    minimal: "border border-slate-200 text-slate-600",
    executive: "bg-amber-50 text-amber-900",
    professional: "bg-brand-50 text-brand-800",
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((skill) => (
        <span
          key={skill}
          className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${tagClass[variant] || tagClass.default}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function ContactLine({ personal, className = "" }) {
  const items = [
    personal.email && { icon: "✉", text: personal.email },
    personal.phone && { icon: "☎", text: personal.phone },
    personal.location && { icon: "◎", text: personal.location },
    personal.linkedin && { icon: "in", text: personal.linkedin },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 ${className}`}>
      {items.map((item) => (
        <span key={item.text} className="inline-flex items-center gap-1">
          <span className="text-[9px] opacity-60">{item.icon}</span>
          {item.text}
        </span>
      ))}
    </div>
  );
}

function ATSStandard({ data }) {
  const { personal, summary, education, experience, projects, skills, achievements, certifications, responsibilities } = data;

  return (
    <div className="bg-white p-10 text-slate-900" style={{ minHeight: "297mm", width: "210mm" }}>
      <header className="border-b-[2.5px] border-slate-900 pb-4">
        <h1 className="text-[26px] font-bold tracking-tight leading-tight">
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1 text-[13px] font-medium text-slate-600">{personal.jobTitle}</p>
        )}
        <ContactLine personal={personal} className="mt-2" />
      </header>

      {summary && (
        <PreviewSection title="Summary" content={summary} variant="default" />
      )}

      {skills && (
        <section className="mb-5">
          <h3 className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-800">
            <span className="h-px flex-1 bg-slate-200" />
            Skills
            <span className="h-px flex-1 bg-slate-200" />
          </h3>
          <SkillsTags skills={skills} />
        </section>
      )}

      <PreviewSection title="Experience" content={experience} />
      <PreviewSection title="Education" content={education} />
      <PreviewSection title="Projects" content={projects} />
      <PreviewSection title="Leadership & Responsibility" content={responsibilities} />
      <PreviewSection title="Achievements" content={achievements} />
      <PreviewSection title="Certifications" content={certifications} />
    </div>
  );
}

function Professional({ data }) {
  const { personal, summary, education, experience, projects, skills, achievements, certifications, responsibilities } = data;

  return (
    <div className="bg-white p-10 font-serif text-slate-900" style={{ minHeight: "297mm", width: "210mm" }}>
      <header className="text-center">
        <h1 className="text-[30px] font-bold tracking-tight text-brand-900">
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1 text-[13px] italic text-slate-600">{personal.jobTitle}</p>
        )}
        <ContactLine personal={personal} className="mt-3 justify-center" />
      </header>
      <div className="my-5 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />

      {summary && <PreviewSection title="Executive Summary" content={summary} variant="professional" />}
      {skills && (
        <section className="mb-5">
          <h3 className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-brand-800">
            Core Competencies
          </h3>
          <SkillsTags skills={skills} variant="professional" />
        </section>
      )}
      <PreviewSection title="Professional Experience" content={experience} variant="professional" />
      <PreviewSection title="Education" content={education} variant="professional" />
      <PreviewSection title="Key Projects" content={projects} variant="professional" />
      <PreviewSection title="Leadership" content={responsibilities} variant="professional" />
      <PreviewSection title="Achievements & Awards" content={achievements} variant="professional" />
      <PreviewSection title="Certifications" content={certifications} variant="professional" />
    </div>
  );
}

function Modern({ data }) {
  const { personal, summary, education, experience, projects, skills, achievements, certifications, responsibilities } = data;

  return (
    <div className="flex bg-white text-slate-900" style={{ minHeight: "297mm", width: "210mm" }}>
      <aside className="w-[74mm] shrink-0 bg-gradient-to-b from-violet-700 via-indigo-700 to-indigo-900 px-5 py-8 text-white">
        <h1 className="text-[18px] font-bold leading-snug">
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1.5 text-[10px] font-medium text-violet-200">{personal.jobTitle}</p>
        )}
        <div className="mt-6 space-y-2.5 border-t border-white/20 pt-5 text-[9px] leading-relaxed text-violet-100">
          {personal.email && <p>{personal.email}</p>}
          {personal.phone && <p>{personal.phone}</p>}
          {personal.location && <p>{personal.location}</p>}
          {personal.linkedin && <p className="break-all opacity-90">{personal.linkedin}</p>}
        </div>
        {skills && (
          <div className="mt-7">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-violet-300">Skills</h3>
            <div className="mt-2.5 space-y-1.5">
              {skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((skill) => (
                <p key={skill} className="text-[9px] text-white/90">▸ {skill}</p>
              ))}
            </div>
          </div>
        )}
        {certifications && (
          <div className="mt-7">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-violet-300">Certifications</h3>
            <p className="mt-2 whitespace-pre-wrap text-[9px] leading-relaxed text-white/90">{certifications}</p>
          </div>
        )}
      </aside>
      <main className="flex-1 px-7 py-8">
        {summary && <PreviewSection title="Profile" content={summary} variant="modern" />}
        <PreviewSection title="Experience" content={experience} variant="modern" />
        <PreviewSection title="Education" content={education} variant="modern" />
        <PreviewSection title="Projects" content={projects} variant="modern" />
        <PreviewSection title="Leadership" content={responsibilities} variant="modern" />
        <PreviewSection title="Achievements" content={achievements} variant="modern" />
      </main>
    </div>
  );
}

function Minimal({ data }) {
  const { personal, summary, education, experience, projects, skills, achievements, certifications, responsibilities } = data;

  return (
    <div className="bg-white px-12 py-10 text-slate-900" style={{ minHeight: "297mm", width: "210mm" }}>
      <header className="mb-8">
        <h1 className="text-[28px] font-light tracking-tight text-slate-900">
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1 text-[12px] text-slate-500">{personal.jobTitle}</p>
        )}
        <ContactLine personal={personal} className="mt-3" />
      </header>
      {summary && (
        <p className="mb-8 text-[11px] leading-relaxed text-slate-600">{summary}</p>
      )}
      {skills && (
        <section className="mb-6">
          <SkillsTags skills={skills} variant="minimal" />
        </section>
      )}
      <PreviewSection title="Experience" content={experience} variant="minimal" />
      <PreviewSection title="Education" content={education} variant="minimal" />
      <PreviewSection title="Projects" content={projects} variant="minimal" />
      <PreviewSection title="Responsibility" content={responsibilities} variant="minimal" />
      <PreviewSection title="Achievements" content={achievements} variant="minimal" />
      <PreviewSection title="Certifications" content={certifications} variant="minimal" />
    </div>
  );
}

function Executive({ data }) {
  const { personal, summary, education, experience, projects, skills, achievements, certifications, responsibilities } = data;

  return (
    <div className="bg-white text-slate-900" style={{ minHeight: "297mm", width: "210mm" }}>
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 px-10 py-8 text-white">
        <h1 className="text-[26px] font-bold tracking-tight">
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1 text-[12px] text-amber-300">{personal.jobTitle}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-300">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </header>
      <div className="p-10">
        {summary && <PreviewSection title="Executive Profile" content={summary} variant="executive" />}
        {skills && (
          <section className="mb-5">
            <h3 className="mb-2 border-l-2 border-amber-500 pl-2 text-[10px] font-bold uppercase tracking-widest">
              Expertise
            </h3>
            <SkillsTags skills={skills} variant="executive" />
          </section>
        )}
        <PreviewSection title="Experience" content={experience} variant="executive" />
        <PreviewSection title="Education" content={education} variant="executive" />
        <PreviewSection title="Projects" content={projects} variant="executive" />
        <PreviewSection title="Leadership" content={responsibilities} variant="executive" />
        <PreviewSection title="Achievements" content={achievements} variant="executive" />
        <PreviewSection title="Certifications" content={certifications} variant="executive" />
      </div>
    </div>
  );
}

const TEMPLATE_MAP = {
  "ATS Standard": ATSStandard,
  Professional,
  Modern,
  Minimal,
  Executive,
};

function isResumeEmpty(data) {
  return ![
    data.personal.name,
    data.personal.email,
    data.summary,
    data.experience,
    data.education,
    data.skills,
  ].some((v) => v?.trim());
}

export default function ResumePreview({ data, previewRef, onTemplateChange, scale = 0.52 }) {
  const Template = TEMPLATE_MAP[data.template] || ATSStandard;
  const empty = isResumeEmpty(data);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Preview</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Updates as you type</p>
        </div>
        <TemplateSwitcher selected={data.template} onSelect={onTemplateChange} />
      </div>

      <div className="relative flex-1 overflow-auto rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-100 to-slate-200/80 p-5 shadow-inner dark:border-slate-700 dark:from-slate-900/60 dark:to-slate-950/60">
        {empty ? (
          <PreviewEmptyState />
        ) : (
          <div className="flex justify-center">
            <motion.div
              key={data.template}
              initial={{ opacity: 0, scale: scale * 0.98 }}
              animate={{ opacity: 1, scale }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top center", width: "210mm" }}
              className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]"
            >
              <div ref={previewRef} className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${data.template}-content`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Template data={data} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
