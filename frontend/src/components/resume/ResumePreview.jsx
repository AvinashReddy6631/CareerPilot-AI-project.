import { motion, AnimatePresence } from "framer-motion";
import PreviewEmptyState from "./PreviewEmptyState";
import TemplateSwitcher from "./TemplateSwitcher";
import { buildResumeDocument } from "../../utils/parseResumeContent";

function ContactLine({ contacts }) {
  if (!contacts.length) return null;

  return (
    <p className="mt-1.5 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 text-[10.5pt] leading-[1.35] text-slate-800">
      {contacts.map((contact, index) => (
        <span key={`${contact.label}-${index}`} className="inline-flex items-center">
          {index > 0 && <span className="mr-1.5 text-slate-500">|</span>}
          {contact.url ? (
            <a href={contact.url} target="_blank" rel="noreferrer" className="underline decoration-slate-400 underline-offset-2">
              {contact.label}
            </a>
          ) : contact.label}
        </span>
      ))}
    </p>
  );
}

function SectionHeading({ children, tracking }) {
  return (
    <h2
      className="mb-2 border-b border-slate-950 pb-1 text-[12pt] font-bold uppercase leading-none text-slate-950"
      style={{ letterSpacing: tracking }}
    >
      {children}
    </h2>
  );
}

function EntryList({ entries }) {
  return (
    <div className="space-y-2.5">
      {entries.map((entry, index) => (
        <div key={`${entry.heading}-${index}`}>
          {entry.heading && <p className="font-bold text-slate-950">{entry.heading}</p>}
          {entry.prose.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          {entry.bullets.length > 0 && (
            <ul className="mt-0.5 space-y-0.5 pl-4">
              {entry.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex} className="pl-0.5">{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ResumeSection({ section, tracking }) {
  return (
    <section className="mb-4 break-inside-avoid last:mb-0">
      <SectionHeading tracking={tracking}>{section.title}</SectionHeading>
      {section.kind === "summary" && <p>{section.content}</p>}
      {section.kind === "skills" && (
        <div className="space-y-1">
          {section.categories.map((category) => (
            <p key={category.label}>
              <strong>{category.label}:</strong> {category.items.join(", ")}
            </p>
          ))}
        </div>
      )}
      {section.kind === "entries" && <EntryList entries={section.entries} />}
      {section.kind === "profiles" && (
        <p>
          {section.content.map((profile, index) => (
            <span key={profile.label}>
              {index > 0 && <span className="px-1.5 text-slate-500">|</span>}
              <strong>{profile.label}:</strong>{" "}
              <a href={profile.url} target="_blank" rel="noreferrer" className="underline decoration-slate-400 underline-offset-2">
                {profile.value}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}

function ATSResumeDocument({ document }) {
  const { personal, contacts, sections, theme } = document;

  return (
    <article
      className="min-h-[297mm] w-[210mm] bg-white px-[0.6in] py-[0.6in] text-[10.5pt] leading-[1.35] text-slate-950"
      style={{ fontFamily: theme.cssFont }}
    >
      <header className="mb-4 text-center">
        <h1 className="text-[20pt] leading-tight text-slate-950" style={{ fontWeight: theme.nameWeight }}>
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && <p className="mt-0.5 font-semibold text-slate-900">{personal.jobTitle}</p>}
        <ContactLine contacts={contacts} />
      </header>
      {sections.map((section) => <ResumeSection key={section.title} section={section} tracking={theme.headingTracking} />)}
    </article>
  );
}

function isResumeEmpty(data) {
  return ![
    data.personal.name,
    data.personal.email,
    data.summary,
    data.experience,
    data.education,
    data.skills,
  ].some((value) => value?.trim());
}

export default function ResumePreview({ data, previewRef, onTemplateChange, scale = 0.52 }) {
  const empty = isResumeEmpty(data);
  const document = buildResumeDocument(data);

  return (
    <div className="flex min-h-[34rem] min-w-0 flex-col lg:h-full lg:min-h-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Preview</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">A4 ATS layout · matches both export formats</p>
        </div>
        <TemplateSwitcher selected={data.template} onSelect={onTemplateChange} />
      </div>

      <div className="relative min-w-0 flex-1 overflow-auto rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-100 to-slate-200/80 p-5 shadow-inner dark:border-slate-700 dark:from-slate-900/60 dark:to-slate-950/60">
        {empty ? <PreviewEmptyState /> : (
          <div className="flex min-h-full justify-start lg:justify-center">
            <motion.div
              key={data.template}
              initial={{ opacity: 0, scale: scale * 0.98 }}
              animate={{ opacity: 1, scale }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "210mm" }}
              className="h-fit origin-top-left shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] lg:origin-top"
            >
              <div ref={previewRef}>
                <AnimatePresence mode="wait">
                  <motion.div key={`${data.template}-content`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ATSResumeDocument document={document} />
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
