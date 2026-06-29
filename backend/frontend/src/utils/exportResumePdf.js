import jsPDF from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const TRANSPARENT = "rgba(0, 0, 0, 0)";

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function oklchToRgb(input) {
  const match = input.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?/i);
  if (!match) return null;

  const l = match[1].endsWith("%") ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  const c = parseFloat(match[2]);
  const h = (parseFloat(match[3]) * Math.PI) / 180;

  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = lPrime ** 3;
  const m3 = mPrime ** 3;
  const s3 = sPrime ** 3;

  const linear = [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];

  const gamma = (channel) =>
    channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * channel ** (1 / 2.4) - 0.055;

  return linear.map((channel) => Math.round(clamp(gamma(channel) * 255)));
}

function parseCssColor(value, fallback = [15, 23, 42]) {
  if (!value || value === TRANSPARENT || value === "transparent") return null;

  const rgb = value.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    const alpha = parts[3] === undefined ? 1 : parseFloat(parts[3]);
    if (alpha === 0) return null;
    return parts.slice(0, 3).map((part) => clamp(parseFloat(part)));
  }

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const full = hex.length === 3 ? hex.split("").map((v) => v + v).join("") : hex;
    return [0, 2, 4].map((start) => parseInt(full.slice(start, start + 2), 16));
  }

  if (value.toLowerCase().startsWith("oklch")) {
    return oklchToRgb(value) || fallback;
  }

  return fallback;
}

function parseGradientColor(value) {
  if (!value || value === "none") return null;
  const colorMatch = value.match(/(oklch\([^)]+\)|rgba?\([^)]+\)|#[0-9a-f]{3,8})/i);
  return colorMatch ? parseCssColor(colorMatch[1]) : null;
}

function setFill(pdf, color) {
  pdf.setFillColor(color[0], color[1], color[2]);
}

function setDraw(pdf, color) {
  pdf.setDrawColor(color[0], color[1], color[2]);
}

function setText(pdf, color) {
  pdf.setTextColor(color[0], color[1], color[2]);
}

function toMm(value, scale) {
  return value * scale;
}

function pageY(yMm) {
  return yMm % A4_HEIGHT_MM;
}

function addPageIfNeeded(pdf, pageIndex, currentPage) {
  while (currentPage.value < pageIndex) {
    pdf.addPage();
    currentPage.value += 1;
  }
}

function drawRectAcrossPages(pdf, rect, color, mode, currentPage) {
  const startPage = Math.floor(rect.y / A4_HEIGHT_MM);
  const endPage = Math.floor((rect.y + rect.height) / A4_HEIGHT_MM);

  for (let page = startPage; page <= endPage; page += 1) {
    addPageIfNeeded(pdf, page, currentPage);
    const top = page * A4_HEIGHT_MM;
    const visibleY = Math.max(rect.y, top);
    const visibleBottom = Math.min(rect.y + rect.height, top + A4_HEIGHT_MM);
    const visibleHeight = visibleBottom - visibleY;

    if (visibleHeight <= 0) continue;

    if (mode === "fill") setFill(pdf, color);
    if (mode === "stroke") setDraw(pdf, color);

    pdf.rect(rect.x, pageY(visibleY), rect.width, visibleHeight, mode === "fill" ? "F" : "S");
  }
}

function getTextNodes(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function drawBackgrounds(pdf, root, rootRect, scale, currentPage) {
  const elements = [root, ...root.querySelectorAll("*")];

  elements.forEach((node) => {
    const style = window.getComputedStyle(node);
    const background = parseCssColor(style.backgroundColor) || parseGradientColor(style.backgroundImage);

    if (!background) return;

    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    drawRectAcrossPages(
      pdf,
      {
        x: toMm(rect.left - rootRect.left, scale),
        y: toMm(rect.top - rootRect.top, scale),
        width: toMm(rect.width, scale),
        height: toMm(rect.height, scale),
      },
      background,
      "fill",
      currentPage
    );
  });
}

function drawBorders(pdf, root, rootRect, scale, currentPage) {
  root.querySelectorAll("*").forEach((node) => {
    const style = window.getComputedStyle(node);
    const color = parseCssColor(style.borderBottomColor);
    const width = parseFloat(style.borderBottomWidth);

    if (!color || !width) return;

    const rect = node.getBoundingClientRect();
    const y = toMm(rect.bottom - rootRect.top, scale);
    const pageIndex = Math.floor(y / A4_HEIGHT_MM);
    addPageIfNeeded(pdf, pageIndex, currentPage);
    setDraw(pdf, color);
    pdf.setLineWidth(Math.max(toMm(width, scale), 0.1));
    pdf.line(
      toMm(rect.left - rootRect.left, scale),
      pageY(y),
      toMm(rect.right - rootRect.left, scale),
      pageY(y)
    );
  });
}

function drawText(pdf, root, rootRect, scale, currentPage) {
  getTextNodes(root).forEach((node) => {
    const parent = node.parentElement;
    if (!parent) return;

    const style = window.getComputedStyle(parent);
    const color = parseCssColor(style.color);
    const range = document.createRange();
    range.selectNodeContents(node);

    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
    range.detach();

    if (!rects.length) return;

    const fontSize = Math.max(toMm(parseFloat(style.fontSize), scale) * 0.72, 2);
    const isBold = Number(style.fontWeight) >= 600 || style.fontWeight === "bold";
    const isItalic = style.fontStyle === "italic";
    const fontStyle = isBold && isItalic ? "bolditalic" : isBold ? "bold" : isItalic ? "italic" : "normal";
    const fontFamily = style.fontFamily.toLowerCase().includes("serif") ? "times" : "helvetica";

    pdf.setFont(fontFamily, fontStyle);
    pdf.setFontSize(fontSize);
    setText(pdf, color || [15, 23, 42]);

    const text = node.nodeValue.replace(/\s+/g, " ").trim();
    const firstRect = rects[0];
    const maxWidth = Math.max(...rects.map((rect) => toMm(rect.width, scale))) + 1;
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = toMm(firstRect.height, scale) || fontSize * 1.25;

    lines.forEach((line, index) => {
      const rect = rects[index] || firstRect;
      const y = toMm(rect.top - rootRect.top, scale);
      const adjustedY = rects[index] ? y : y + lineHeight * index;
      const pageIndex = Math.floor(adjustedY / A4_HEIGHT_MM);
      addPageIfNeeded(pdf, pageIndex, currentPage);
      pdf.text(line, toMm(rect.left - rootRect.left, scale), pageY(adjustedY + lineHeight * 0.76), {
        maxWidth,
        baseline: "alphabetic",
      });
    });
  });
}

function sanitizeFileName(fileName) {
  return (fileName || "Resume").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Resume";
}

export async function exportResumePdf(element, fileName = "Resume") {
  if (!element) {
    throw new Error("Resume preview is not available for export");
  }

  await document.fonts?.ready;

  const rootRect = element.getBoundingClientRect();
  if (!rootRect.width || !rootRect.height) {
    throw new Error("Resume preview is empty");
  }

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const scale = A4_WIDTH_MM / rootRect.width;
  const currentPage = { value: 0 };

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, "F");

  drawBackgrounds(pdf, element, rootRect, scale, currentPage);
  drawBorders(pdf, element, rootRect, scale, currentPage);
  drawText(pdf, element, rootRect, scale, currentPage);

  pdf.save(`${sanitizeFileName(fileName)}_Resume.pdf`);
}
