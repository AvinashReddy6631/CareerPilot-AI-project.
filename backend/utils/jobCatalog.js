const JobListing = require("../models/JobListing");

const SOURCES = ["greenhouse", "lever"];

const asText = (value) => (typeof value === "string" ? value.trim() : "");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const asPositiveInteger = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
};

const toClientJob = (listing) => ({
  id: listing.listingId,
  source: listing.source,
  company: listing.company,
  role: listing.role,
  location: listing.location,
  workplaceType: listing.workplaceType,
  employmentType: listing.employmentType,
  salary: listing.salary,
  experience: listing.experience,
  type: listing.type,
  skills: listing.skills || [],
  description: listing.description,
  applyUrl: listing.applyUrl,
  publishedAt: listing.publishedAt,
  sourceUpdatedAt: listing.sourceUpdatedAt,
  lastFetchedAt: listing.lastFetchedAt,
  status: listing.status,
});

const searchJobs = async ({
  query = "",
  location = "",
  type = "",
  sources = [],
  sourceKeys = [],
  page = 1,
  limit = 20,
}) => {
  const normalizedSources = (Array.isArray(sources) ? sources : [])
    .map((source) => asText(source).toLowerCase())
    .filter((source) => SOURCES.includes(source));
  const normalizedSourceKeys = (Array.isArray(sourceKeys) ? sourceKeys : [])
    .map(asText)
    .filter(Boolean);
  const filters = {
    status: "active",
    source: { $in: normalizedSources.length ? normalizedSources : SOURCES },
  };

  // An empty configuration must not hide genuine listings cached from a prior
  // successful refresh. Restrict to configured boards only when there is an
  // explicit allow-list.
  if (normalizedSourceKeys.length) {
    filters.sourceKey = { $in: normalizedSourceKeys };
  }

  if (["job", "internship"].includes(type)) filters.type = type;

  const queryTerms = asText(query)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  const normalizedLocation = asText(location).toLowerCase();
  const allConditions = [];

  if (queryTerms.length) {
    allConditions.push(
      ...queryTerms.map((term) => {
        const pattern = new RegExp(escapeRegex(term), "i");
        return {
          $or: [
            { company: pattern },
            { role: pattern },
            { location: pattern },
            { description: pattern },
            { skills: pattern },
          ],
        };
      })
    );
  }

  if (normalizedLocation) {
    allConditions.push({ location: new RegExp(escapeRegex(normalizedLocation), "i") });
  }

  if (allConditions.length) filters.$and = allConditions;

  const safePage = asPositiveInteger(page, 1, 10000);
  const safeLimit = asPositiveInteger(limit, 20, 100);
  const [total, listings] = await Promise.all([
    JobListing.countDocuments(filters),
    JobListing.find(filters)
      .sort({ publishedAt: -1, lastFetchedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
  ]);

  return {
    jobs: listings.map(toClientJob),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
    sources: SOURCES,
  };
};

const getJobById = async (listingId) => {
  const job = await JobListing.findOne({ listingId: asText(listingId), status: "active" }).lean();
  return job ? toClientJob(job) : null;
};

module.exports = {
  SOURCES,
  getJobById,
  searchJobs,
  toClientJob,
};
