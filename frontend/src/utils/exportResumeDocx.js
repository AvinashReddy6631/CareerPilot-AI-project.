import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { buildResumeDocument } from "./parseResumeContent";

const BODY_SIZE = 21;
const BODY_LINE = 284;
const TEXT_COLOR = "0F172A";

function sanitizeFileName(fileName) {
  return (fileName || "Resume").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Resume";
}

function run(text, options = {}) {
  return new TextRun({
    text,
    font: options.font,
    size: options.size || BODY_SIZE,
    bold: options.bold || false,
    color: TEXT_COLOR,
  });
}

function bodyParagraph(children, options = {}) {
  return new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { line: BODY_LINE, after: options.after ?? 36, before: options.before ?? 0 },
    alignment: options.alignment,
    bullet: options.bullet ? { level: 0 } : undefined,
  });
}

function sectionHeading(title, font) {
  return new Paragraph({
    children: [run(title.toUpperCase(), { font, size: 24, bold: true })],
    spacing: { before: 150, after: 90 },
    border: {
      bottom: { color: TEXT_COLOR, space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
  });
}

function contactParagraph(contacts, font) {
  const children = [];
  contacts.forEach((contact, index) => {
    if (index > 0) children.push(run(" | ", { font }));
    children.push(contact.url
      ? new ExternalHyperlink({ link: contact.url, children: [run(contact.label, { font })] })
      : run(contact.label, { font }));
  });
  return bodyParagraph(children, { alignment: AlignmentType.CENTER, after: 90 });
}

function entryParagraphs(entries, font) {
  return entries.flatMap((entry) => [
    ...(entry.heading ? [bodyParagraph(run(entry.heading, { font, bold: true }), { after: 8 })] : []),
    ...entry.prose.map((paragraph) => bodyParagraph(run(paragraph, { font }), { after: 8 })),
    ...entry.bullets.map((bullet) => bodyParagraph(run(bullet, { font }), { bullet: true, after: 8 })),
    bodyParagraph(run("", { font }), { after: 18 }),
  ]);
}

function sectionParagraphs(section, font) {
  const paragraphs = [sectionHeading(section.title, font)];

  if (section.kind === "summary") {
    paragraphs.push(bodyParagraph(run(section.content, { font }), { after: 24 }));
  }

  if (section.kind === "skills") {
    section.categories.forEach((category) => {
      paragraphs.push(bodyParagraph([
        run(`${category.label}: `, { font, bold: true }),
        run(category.items.join(", "), { font }),
      ], { after: 8 }));
    });
    paragraphs.push(bodyParagraph(run("", { font }), { after: 16 }));
  }

  if (section.kind === "entries") paragraphs.push(...entryParagraphs(section.entries, font));

  if (section.kind === "profiles") {
    section.content.forEach((profile) => {
      paragraphs.push(bodyParagraph([
        run(`${profile.label}: `, { font, bold: true }),
        new ExternalHyperlink({ link: profile.url, children: [run(profile.value, { font })] }),
      ], { after: 8 }));
    });
  }

  return paragraphs;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function exportResumeDocx(data, fileName = "Resume") {
  const resume = buildResumeDocument(data);
  const font = resume.theme.docxFont;
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [run(resume.personal.name || "Your Name", { font, size: 40, bold: true })],
      spacing: { after: resume.personal.jobTitle ? 16 : 0 },
    }),
    ...(resume.personal.jobTitle
      ? [bodyParagraph(run(resume.personal.jobTitle, { font, bold: true }), { alignment: AlignmentType.CENTER, after: 12 })]
      : []),
    ...(resume.contacts.length ? [contactParagraph(resume.contacts, font)] : []),
    ...resume.sections.flatMap((section) => sectionParagraphs(section, font)),
  ];

  const document = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 864, right: 864, bottom: 864, left: 864 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `${sanitizeFileName(fileName)}_Resume.docx`);
  return blob;
}
