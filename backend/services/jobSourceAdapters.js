const DEFAULT_TIMEOUT_MS = 12_000;
const LEVER_PAGE_SIZE = 100;
const MAX_LEVER_PAGES = 20;

const asText = (value) => (typeof value === "string" ? value.trim() : "");

const parseJsonArray = (value, variableName) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new Error("must be a JSON array");
    }
    return parsed;
  } catch (error) {
    throw new Error(`${variableName} ${error.message}`);
  }
};

const normalizeConfiguredSource = (source, value) => {
  const identifier = asText(source === "greenhouse" ? value?.boardToken : value?.site);
  const company = asText(value?.company);

  if (!identifier || !company) return null;

  return {
    source,
    identifier,
    company,
    label: `${company} (${source === "greenhouse" ? "Greenhouse" : "Lever"})`,
    sourceKey: `${source}:${identifier.toLowerCase()}`,
  };
};

const getConfiguredJobSources = (env = process.env) => {
  const greenhouse = parseJsonArray(env.JOB_GREENHOUSE_BOARDS, "JOB_GREENHOUSE_BOARDS")
    .map((entry) => normalizeConfiguredSource("greenhouse", entry))
    .filter(Boolean);
  const lever = parseJsonArray(env.JOB_LEVER_SITES, "JOB_LEVER_SITES")
    .map((entry) => normalizeConfiguredSource("lever", entry))
    .filter(Boolean);

  return [...greenhouse, ...lever];
};

const isSafeExternalUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

const safeUrl = (value) => (isSafeExternalUrl(value) ? value : "");

const plainText = (value) =>
  asText(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const dateOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const metadataText = (metadata, fieldPattern) => {
  if (!Array.isArray(metadata)) return "";

  const values = metadata
    .filter((item) => fieldPattern.test(asText(item?.name || item?.label || item?.text)))
    .flatMap((item) => {
      const value = item?.value ?? item?.content;
      return Array.isArray(value) ? value : [value];
    })
    .map((value) => asText(String(value ?? "")))
    .filter(Boolean);

  return values.join(", ");
};

const metadataSkills = (metadata) => {
  if (!Array.isArray(metadata)) return [];

  return metadata
    .filter((item) => /skills?/i.test(asText(item?.name || item?.label || item?.text)))
    .flatMap((item) => {
      const value = item?.value ?? item?.content;
      return Array.isArray(value) ? value : [value];
    })
    .flatMap((value) => asText(String(value ?? "")).split(/[,;|]/))
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const listingType = (...values) =>
  values.some((value) => /\bintern(ship)?\b/i.test(asText(value))) ? "internship" : "job";

const normalizeGreenhouseJob = (job, config, fetchedAt) => {
  const externalId = asText(String(job?.id ?? ""));
  const applyUrl = safeUrl(job?.absolute_url);
  const role = asText(job?.title);

  if (!externalId || !role || !applyUrl) return null;

  return {
    source: "greenhouse",
    sourceKey: config.sourceKey,
    externalId,
    listingId: `${config.sourceKey}:${externalId}`,
    company: config.company,
    role,
    location: asText(job?.location?.name),
    workplaceType: metadataText(job?.metadata, /remote|hybrid|workplace/i),
    employmentType: metadataText(job?.metadata, /employment|commitment|job type/i),
    salary: metadataText(job?.metadata, /salary|compensation|pay/i),
    experience: metadataText(job?.metadata, /experience|seniority/i),
    type: listingType(job?.title, job?.departments?.map((department) => department?.name).join(" ")),
    skills: metadataSkills(job?.metadata),
    description: plainText(job?.content),
    applyUrl,
    // Greenhouse's public endpoint exposes updated_at, not the original publication time.
    publishedAt: null,
    sourceUpdatedAt: dateOrNull(job?.updated_at),
    lastFetchedAt: fetchedAt,
    lastSeenAt: fetchedAt,
    status: "active",
    closedAt: null,
  };
};

const normalizeLeverJob = (job, config, fetchedAt) => {
  const externalId = asText(job?.id);
  const applyUrl = safeUrl(job?.hostedUrl || job?.applyUrl);
  const role = asText(job?.text);

  if (!externalId || !role || !applyUrl) return null;

  const categories = job?.categories || {};
  const lists = Array.isArray(job?.lists) ? job.lists : [];

  return {
    source: "lever",
    sourceKey: config.sourceKey,
    externalId,
    listingId: `${config.sourceKey}:${externalId}`,
    company: config.company,
    role,
    location: asText(categories.location),
    workplaceType: "",
    employmentType: asText(categories.commitment),
    salary: metadataText(lists, /salary|compensation|pay/i),
    experience: metadataText(lists, /experience|seniority/i),
    type: listingType(job?.text, categories.commitment, categories.team, categories.department),
    skills: metadataSkills(lists),
    description: plainText(job?.descriptionPlain || job?.description),
    applyUrl,
    publishedAt: dateOrNull(job?.createdAt),
    sourceUpdatedAt: dateOrNull(job?.updatedAt),
    lastFetchedAt: fetchedAt,
    lastSeenAt: fetchedAt,
    status: "active",
    closedAt: null,
  };
};

const fetchJson = async (url, { fetchImpl = global.fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Source request failed with HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchGreenhouseBoard = async (config, options) => {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(
    config.identifier
  )}/jobs?content=true`;
  const payload = await fetchJson(url, options);

  if (!Array.isArray(payload?.jobs)) {
    throw new Error("Greenhouse returned an invalid jobs payload");
  }

  const fetchedAt = new Date();
  return payload.jobs.map((job) => normalizeGreenhouseJob(job, config, fetchedAt)).filter(Boolean);
};

const fetchLeverSite = async (config, options) => {
  const listings = [];

  for (let page = 0; page < MAX_LEVER_PAGES; page += 1) {
    const skip = page * LEVER_PAGE_SIZE;
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(
      config.identifier
    )}?mode=json&skip=${skip}&limit=${LEVER_PAGE_SIZE}`;
    const payload = await fetchJson(url, options);

    if (!Array.isArray(payload)) {
      throw new Error("Lever returned an invalid jobs payload");
    }

    listings.push(...payload);
    if (payload.length < LEVER_PAGE_SIZE) break;

    if (page === MAX_LEVER_PAGES - 1) {
      throw new Error("Lever pagination limit reached");
    }
  }

  const fetchedAt = new Date();
  return listings.map((job) => normalizeLeverJob(job, config, fetchedAt)).filter(Boolean);
};

const fetchSourceListings = (config, options) => {
  if (config.source === "greenhouse") return fetchGreenhouseBoard(config, options);
  if (config.source === "lever") return fetchLeverSite(config, options);
  throw new Error(`Unsupported job source: ${config.source}`);
};

module.exports = {
  fetchGreenhouseBoard,
  fetchLeverSite,
  fetchSourceListings,
  getConfiguredJobSources,
  isSafeExternalUrl,
  normalizeGreenhouseJob,
  normalizeLeverJob,
};
