import { motion, AnimatePresence } from "framer-motion";
import PreviewEmptyState from "./PreviewEmptyState";
import TemplateSwitcher from "./TemplateSwitcher";
import { buildResumeDocument } from "../../utils/parseResumeContent";

function ContactLine({ contacts, className = "" }) {
  if (!contacts.length) return null;

  return (
    <p className={`mt-1.5 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 text-[10.5pt] leading-[1.35] text-slate-800 ${className}`}>
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

function SectionHeading({ children, tracking, className = "" }) {
  return (
    <h2
      className={`mb-2 border-b border-slate-950 pb-1 text-[12pt] font-bold uppercase leading-none text-slate-950 ${className}`}
      style={{ letterSpacing: tracking }}
    >
      {children}
    </h2>
  );
}

function EntryList({ entries, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
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

function ResumeSection({
  section,
  tracking,
  className = "",
  headingClassName = "",
  contentClassName = "",
  entryClassName = "",
}) {
  return (
    <section className={`mb-4 break-inside-avoid last:mb-0 ${className}`}>
      <SectionHeading tracking={tracking} className={headingClassName}>{section.title}</SectionHeading>
      {section.kind === "summary" && <p className={contentClassName}>{section.content}</p>}
      {section.kind === "skills" && (
        <div className={`space-y-1 ${contentClassName}`}>
          {section.categories.map((category) => (
            <p key={category.label}>
              <strong>{category.label}:</strong> {category.items.join(", ")}
            </p>
          ))}
        </div>
      )}
      {section.kind === "entries" && <EntryList entries={section.entries} className={entryClassName} />}
      {section.kind === "profiles" && (
        <p className={contentClassName}>
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

const NEW_TEMPLATE_STYLES = {
  Creative: {
    article: "border-t-[12px] border-fuchsia-600 px-[0.6in] py-[0.55in]",
    header: "mb-5 border-b-2 border-fuchsia-600 pb-4 text-left",
    kicker: "text-[8pt] font-bold uppercase tracking-[0.24em] text-fuchsia-700",
    name: "text-[25pt] tracking-tight text-slate-950",
    jobTitle: "mt-1 text-[11pt] font-semibold uppercase tracking-[0.12em] text-fuchsia-700",
    contacts: "justify-start text-[9.5pt]",
    section: "mb-5",
    heading: "border-fuchsia-600 text-fuchsia-800",
    tracking: "0.1em",
  },
  Academic: {
    article: "border-t-4 border-sky-800 px-[0.7in] py-[0.65in]",
    header: "mb-6 text-center",
    kicker: "text-[8pt] font-bold uppercase tracking-[0.2em] text-sky-800",
    name: "mt-1 text-[23pt] text-slate-950",
    jobTitle: "mt-1 text-[11pt] italic text-slate-700",
    contacts: "text-[9.5pt]",
    section: "mb-5",
    heading: "border-sky-800 text-sky-950",
    tracking: "0.08em",
  },
  Compact: {
    article: "border-t-8 border-emerald-600 px-[0.48in] py-[0.45in] text-[9.5pt] leading-[1.28]",
    header: "mb-3 border-b border-emerald-600 pb-2 text-left",
    kicker: "text-[7.5pt] font-bold uppercase tracking-[0.18em] text-emerald-700",
    name: "text-[20pt] tracking-tight text-slate-950",
    jobTitle: "mt-0.5 text-[10pt] font-semibold text-slate-700",
    contacts: "mt-1 justify-start text-[8.5pt]",
    section: "mb-2.5",
    heading: "mb-1 border-emerald-600 pb-0.5 text-[10pt] text-emerald-800",
    tracking: "0.08em",
    content: "text-[9.5pt]",
    entries: "space-y-1.5",
  },
};

function StyledResumeDocument({ document }) {
  const style = NEW_TEMPLATE_STYLES[document.template];
  const { personal, contacts, sections } = document;

  if (!style) return <ATSResumeDocument document={document} />;

  return (
    <article
      className={`min-h-[297mm] w-[210mm] bg-white text-slate-950 ${style.article}`}
      style={{ fontFamily: document.theme.cssFont }}
    >
      <header className={style.header}>
        <p className={style.kicker}>
          {document.template === "Creative" ? "Creative portfolio" : document.template === "Academic" ? "Academic curriculum vitae" : "Condensed professional profile"}
        </p>
        <h1 className={style.name} style={{ fontWeight: document.theme.nameWeight }}>
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && <p className={style.jobTitle}>{personal.jobTitle}</p>}
        <ContactLine contacts={contacts} className={style.contacts} />
      </header>
      {sections.map((section) => (
        <ResumeSection
          key={section.title}
          section={section}
          tracking={style.tracking}
          className={style.section}
          headingClassName={style.heading}
          contentClassName={style.content}
          entryClassName={style.entries}
        />
      ))}
    </article>
  );
}

function TechnicalResumeDocument({ document }) {
  const { personal, contacts, sections, theme } = document;
  const sidebarTitles = new Set(["Technical Skills", "Coding Profiles"]);
  const sidebarSections = sections.filter((section) => sidebarTitles.has(section.title));
  const mainSections = sections.filter((section) => !sidebarTitles.has(section.title));

  return (
    <article
      className="min-h-[297mm] w-[210mm] border-t-8 border-cyan-600 bg-white px-[0.55in] py-[0.55in] text-[10pt] leading-[1.32] text-slate-950"
      style={{ fontFamily: theme.cssFont }}
    >
      <header className="mb-5 border-b-2 border-slate-900 pb-3">
        <p className="text-[8pt] font-bold uppercase tracking-[0.2em] text-cyan-700">Technical profile</p>
        <h1 className="mt-1 text-[23pt] leading-tight text-slate-950" style={{ fontWeight: theme.nameWeight }}>
          {personal.name || "Your Name"}
        </h1>
        {personal.jobTitle && <p className="mt-0.5 font-semibold text-slate-700">{personal.jobTitle}</p>}
        <ContactLine contacts={contacts} className="justify-start text-[9.5pt]" />
      </header>

      <div className="grid grid-cols-[57mm_minmax(0,1fr)] gap-5">
        <aside className="border-r border-cyan-200 pr-4">
          {sidebarSections.map((section) => (
            <ResumeSection
              key={section.title}
              section={section}
              tracking="0.1em"
              className="mb-5"
              headingClassName="border-cyan-600 text-cyan-800"
              contentClassName="text-[9.5pt]"
              entryClassName="space-y-1.5"
            />
          ))}
        </aside>
        <main>
          {mainSections.map((section) => (
            <ResumeSection
              key={section.title}
              section={section}
              tracking="0.1em"
              className="mb-4"
              headingClassName="border-slate-900 text-slate-950"
              entryClassName="space-y-2"
            />
          ))}
        </main>
      </div>
    </article>
  );
}

function ResumeDocument({ document }) {
  if (document.template === "Technical") return <TechnicalResumeDocument document={document} />;
  if (NEW_TEMPLATE_STYLES[document.template]) return <StyledResumeDocument document={document} />;
  return <ATSResumeDocument document={document} />;
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
                    <ResumeDocument document={document} />
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
