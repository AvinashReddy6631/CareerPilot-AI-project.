const ANALYTICS_RANGES = new Set(["7d", "30d", "all"]);

const normalizeAnalyticsRange = (value) =>
  ANALYTICS_RANGES.has(value) ? value : "30d";

const getRangeStart = (range, now = new Date()) => {
  const normalizedRange = normalizeAnalyticsRange(range);
  if (normalizedRange === "all") return null;

  const days = normalizedRange === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

const isValidScore = (value, maximum, minimum = 0) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= minimum &&
  value <= maximum;

const roundScore = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
};

const calculateScoreChange = (points) => {
  if (!Array.isArray(points) || points.length < 2) return null;
  const latest = points[points.length - 1]?.value;
  const previous = points[points.length - 2]?.value;

  if (!Number.isFinite(latest) || !Number.isFinite(previous)) return null;
  return roundScore(latest - previous);
};

module.exports = {
  normalizeAnalyticsRange,
  getRangeStart,
  isValidScore,
  roundScore,
  calculateScoreChange,
};
