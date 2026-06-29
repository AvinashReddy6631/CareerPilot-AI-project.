const ACTION_VERBS = [
  "Achieved",
  "Built",
  "Delivered",
  "Designed",
  "Developed",
  "Engineered",
  "Implemented",
  "Improved",
  "Launched",
  "Led",
  "Managed",
  "Optimized",
  "Reduced",
  "Scaled",
  "Spearheaded",
];

function startsWithVerb(line) {
  const first = line.split(/\s+/)[0]?.toLowerCase();
  return ACTION_VERBS.some((v) => v.toLowerCase() === first);
}

function capitalize(line) {
  if (!line) return line;
  return line.charAt(0).toUpperCase() + line.slice(1);
}

export function enhanceToBullets(text) {
  if (!text?.trim()) return "";

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const cleaned = line.replace(/^[•\-*]\s*/, "").trim();
      const isHeader = /—|\||\(\d{4}/.test(cleaned) && cleaned.length < 80;

      if (isHeader) return cleaned;

      let bullet = cleaned;
      if (!startsWithVerb(bullet)) {
        const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
        bullet = `${verb} ${bullet.charAt(0).toLowerCase()}${bullet.slice(1)}`;
      }

      return `• ${capitalize(bullet.replace(/\.$/, ""))}`;
    })
    .join("\n");
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
