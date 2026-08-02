import { jsPDF } from "jspdf";
import { buildResumeDocument } from "./parseResumeContent";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 43.2;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_SIZE = 10.5;
const BODY_LINE_HEIGHT = BODY_SIZE * 1.35;
const SECTION_SIZE = 12;

function sanitizeFileName(fileName) {
  return (fileName || "Resume").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Resume";
}

function ensureSpace(pdf, y, requiredHeight) {
  if (y + requiredHeight <= PAGE_HEIGHT - MARGIN) return y;
  pdf.addPage();
  return MARGIN;
}

function setFont(pdf, theme, style = "normal", size = BODY_SIZE) {
  pdf.setFont(theme.pdfFont, style);
  pdf.setFontSize(size);
  pdf.setTextColor(15, 23, 42);
}

function writeWrappedText(pdf, text, x, y, maxWidth, theme, options = {}) {
  const { style = "normal", size = BODY_SIZE, indent = 0, before = 0, after = 0 } = options;
  setFont(pdf, theme, style, size);
  const lineHeight = size * 1.35;
  const lines = pdf.splitTextToSize(text || "", maxWidth - indent);
  let nextY = ensureSpace(pdf, y + before, lines.length * lineHeight + after) + before;

  lines.forEach((line) => {
    nextY = ensureSpace(pdf, nextY, lineHeight);
    pdf.text(line, x + indent, nextY);
    nextY += lineHeight;
  });

  return nextY + after;
}

function writeContactLines(pdf, contacts, y, theme) {
  setFont(pdf, theme, "normal", BODY_SIZE);
  const separator = " | ";
  const rows = [];
  let row = [];
  let rowWidth = 0;

  contacts.forEach((contact) => {
    const itemWidth = pdf.getTextWidth(contact.label);
    const separatorWidth = row.length ? pdf.getTextWidth(separator) : 0;
    if (row.length && rowWidth + separatorWidth + itemWidth > CONTENT_WIDTH) {
      rows.push(row);
      row = [contact];
      rowWidth = itemWidth;
    } else {
      row.push(contact);
      rowWidth += separatorWidth + itemWidth;
    }
  });
  if (row.length) rows.push(row);

  let nextY = y;
  rows.forEach((items) => {
    nextY = ensureSpace(pdf, nextY, BODY_LINE_HEIGHT);
    const widths = items.map((item) => pdf.getTextWidth(item.label));
    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(items.length - 1, 0) * pdf.getTextWidth(separator);
    let x = (PAGE_WIDTH - totalWidth) / 2;
    items.forEach((item, index) => {
      if (index > 0) {
        pdf.text(separator, x, nextY);
        x += pdf.getTextWidth(separator);
      }
      if (item.url) pdf.textWithLink(item.label, x, nextY, { url: item.url });
      else pdf.text(item.label, x, nextY);
      x += pdf.getTextWidth(item.label);
    });
    nextY += BODY_LINE_HEIGHT;
  });
  return nextY;
}

function writeSectionHeading(pdf, title, y, theme) {
  y = ensureSpace(pdf, y + 7, 26);
  setFont(pdf, theme, "bold", SECTION_SIZE);
  pdf.text(title.toUpperCase(), MARGIN, y);
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.6);
  pdf.line(MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4);
  return y + 17;
}

function writeEntries(pdf, entries, y, theme) {
  entries.forEach((entry) => {
    if (entry.heading) y = writeWrappedText(pdf, entry.heading, MARGIN, y, CONTENT_WIDTH, theme, { style: "bold", after: 1 });
    entry.prose.forEach((paragraph) => {
      y = writeWrappedText(pdf, paragraph, MARGIN, y, CONTENT_WIDTH, theme, { after: 1 });
    });
    entry.bullets.forEach((bullet) => {
      setFont(pdf, theme, "normal", BODY_SIZE);
      const bulletIndent = 14;
      const lines = pdf.splitTextToSize(bullet, CONTENT_WIDTH - bulletIndent);
      y = ensureSpace(pdf, y, lines.length * BODY_LINE_HEIGHT + 1);
      pdf.text("•", MARGIN + 2, y);
      lines.forEach((line) => {
        y = ensureSpace(pdf, y, BODY_LINE_HEIGHT);
        pdf.text(line, MARGIN + bulletIndent, y);
        y += BODY_LINE_HEIGHT;
      });
      y += 1;
    });
    y += 3;
  });
  return y;
}

function writeProfiles(pdf, profiles, y, theme) {
  profiles.forEach((profile) => {
    setFont(pdf, theme, "bold", BODY_SIZE);
    const label = `${profile.label}: `;
    y = ensureSpace(pdf, y, BODY_LINE_HEIGHT);
    pdf.text(label, MARGIN, y);
    setFont(pdf, theme, "normal", BODY_SIZE);
    pdf.textWithLink(profile.value, MARGIN + pdf.getTextWidth(label), y, { url: profile.url });
    y += BODY_LINE_HEIGHT;
  });
  return y;
}

export async function exportResumePdf(data, fileName = "Resume") {
  const resume = buildResumeDocument(data);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  let y = MARGIN;

  setFont(pdf, resume.theme, "bold", 20);
  const name = resume.personal.name || "Your Name";
  pdf.text(name, PAGE_WIDTH / 2, y, { align: "center" });
  y += 18;

  if (resume.personal.jobTitle) {
    setFont(pdf, resume.theme, "bold", BODY_SIZE);
    pdf.text(resume.personal.jobTitle, PAGE_WIDTH / 2, y, { align: "center" });
    y += BODY_LINE_HEIGHT;
  }

  y = writeContactLines(pdf, resume.contacts, y, resume.theme) + 5;

  resume.sections.forEach((section) => {
    y = writeSectionHeading(pdf, section.title, y, resume.theme);
    if (section.kind === "summary") y = writeWrappedText(pdf, section.content, MARGIN, y, CONTENT_WIDTH, resume.theme, { after: 2 });
    if (section.kind === "skills") {
      section.categories.forEach((category) => {
        setFont(pdf, resume.theme, "bold", BODY_SIZE);
        const label = `${category.label}: `;
        const value = category.items.join(", ");
        const labelWidth = pdf.getTextWidth(label);
        const lines = pdf.splitTextToSize(value, CONTENT_WIDTH - labelWidth);
        y = ensureSpace(pdf, y, Math.max(lines.length, 1) * BODY_LINE_HEIGHT);
        pdf.text(label, MARGIN, y);
        setFont(pdf, resume.theme, "normal", BODY_SIZE);
        lines.forEach((line, index) => {
          pdf.text(line, MARGIN + labelWidth, y + index * BODY_LINE_HEIGHT);
        });
        y += Math.max(lines.length, 1) * BODY_LINE_HEIGHT;
      });
      y += 2;
    }
    if (section.kind === "entries") y = writeEntries(pdf, section.entries, y, resume.theme);
    if (section.kind === "profiles") y = writeProfiles(pdf, section.content, y, resume.theme);
  });

  pdf.save(`${sanitizeFileName(fileName)}_Resume.pdf`);
  return pdf;
}
