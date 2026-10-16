const JobListing = require("../models/JobListing");
const JobRefreshState = require("../models/JobRefreshState");
const {
  fetchSourceListings,
  getConfiguredJobSources,
} = require("./jobSourceAdapters");

const REFRESH_STATE_ID = "job-listing-refresh";
const DEFAULT_LOCK_MS = 15 * 60 * 1000;

const getPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getRefreshIntervalMs = (env = process.env) =>
  getPositiveInteger(env.JOB_REFRESH_INTERVAL_HOURS, 24) * 60 * 60 * 1000;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchWithRetry = async (source) => {
  const retries = getPositiveInteger(process.env.JOB_REFRESH_RETRIES, 2);
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchSourceListings(source);
    } catch (error) {
      lastError = error;
      if (attempt < retries) await wait((attempt + 1) * 300);
    }
  }

  throw lastError;
};

const tryAcquireRefreshLock = async () => {
  const now = new Date();
  const lockUntil = new Date(
    now.getTime() + getPositiveInteger(process.env.JOB_REFRESH_LOCK_MS, DEFAULT_LOCK_MS)
  );

  try {
    return await JobRefreshState.findOneAndUpdate(
      {
        _id: REFRESH_STATE_ID,
        $or: [{ lockUntil: null }, { lockUntil: { $exists: false } }, { lockUntil: { $lte: now } }],
      },
      {
        $set: { lockUntil, lastAttemptAt: now },
        $setOnInsert: { sourceStatuses: [] },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Concurrent instances can race to create the singleton document. The unique _id
    // makes the losing instance skip this refresh instead of running in parallel.
    if (error?.code === 11000) return null;
    throw error;
  }
};

const persistListings = async (source, listings) => {
  const fetchedAt = new Date();
  const operations = listings.map((listing) => ({
    updateOne: {
      filter: { sourceKey: listing.sourceKey, externalId: listing.externalId },
      update: {
        $set: { ...listing, lastFetchedAt: fetchedAt, lastSeenAt: fetchedAt, status: "active", closedAt: null },
      },
      upsert: true,
    },
  }));

  if (operations.length) {
    await JobListing.bulkWrite(operations, { ordered: false });
  }

  const externalIds = listings.map((listing) => listing.externalId);
  await JobListing.updateMany(
    {
      sourceKey: source.sourceKey,
      status: "active",
      externalId: { $nin: externalIds },
    },
    { $set: { status: "closed", closedAt: fetchedAt } }
  );
};

const mergeSourceStatus = (existingStatuses, source, status) => {
  const next = existingStatuses.filter((item) => item.sourceKey !== source.sourceKey);
  next.push({ sourceKey: source.sourceKey, source: source.source, label: source.label, ...status });
  return next;
};

const refreshJobListings = async () => {
  const state = await tryAcquireRefreshLock();
  if (!state) return { started: false, reason: "already_running" };

  const startedAt = new Date();

  try {
    let sources;
    try {
      sources = getConfiguredJobSources();
    } catch (error) {
      state.lockUntil = null;
      await state.save();
      return { started: true, success: false, message: error.message, sources: [] };
    }

    let sourceStatuses = state.sourceStatuses || [];
    let successfulSources = 0;

    for (const source of sources) {
      const attemptedAt = new Date();

      try {
        const listings = await fetchWithRetry(source);
        await persistListings(source, listings);
        successfulSources += 1;
        sourceStatuses = mergeSourceStatus(sourceStatuses, source, {
          status: "success",
          lastAttemptAt: attemptedAt,
          lastSuccessAt: new Date(),
          listingsFetched: listings.length,
          message: "",
        });
      } catch (error) {
        // A failed source never deactivates its earlier listings.
        sourceStatuses = mergeSourceStatus(sourceStatuses, source, {
          status: "failed",
          lastAttemptAt: attemptedAt,
          lastSuccessAt:
            sourceStatuses.find((item) => item.sourceKey === source.sourceKey)?.lastSuccessAt || null,
          listingsFetched: 0,
          message: "Unable to refresh this source. Showing its last successful results when available.",
        });
        console.error(`Job refresh failed for ${source.label}:`, error.message);
      }
    }

    state.sourceStatuses = sourceStatuses;
    if (successfulSources > 0) state.lastSuccessfulRefreshAt = new Date();
    state.lockUntil = null;
    await state.save();

    return {
      started: true,
      success: successfulSources > 0,
      sources: sourceStatuses,
      successfulSources,
      configuredSources: sources.length,
      startedAt,
    };
  } catch (error) {
    state.lockUntil = null;
    await state.save();
    throw error;
  }
};

const getRefreshMetadata = async () => {
  const state = await JobRefreshState.findById(REFRESH_STATE_ID).lean();
  let configuredSources = [];

  try {
    configuredSources = getConfiguredJobSources();
  } catch {
    // The search endpoint remains available for previously fetched listings when configuration is invalid.
  }

  const sourceStatuses = (state?.sourceStatuses || []).map((status) => ({
    source: status.source,
    label: status.label,
    status: status.status,
    lastAttemptAt: status.lastAttemptAt,
    lastSuccessAt: status.lastSuccessAt,
    listingsFetched: status.listingsFetched,
  }));

  return {
    lastSuccessfulRefreshAt: state?.lastSuccessfulRefreshAt || null,
    configuredSources: [...new Set(configuredSources.map((source) => source.source))],
    configuredSourceKeys: configuredSources.map((source) => source.sourceKey),
    sourceStatuses,
    stale: sourceStatuses.some((status) => status.status === "failed"),
  };
};

let schedulerStarted = false;

const startJobRefreshScheduler = () => {
  if (schedulerStarted || process.env.JOB_REFRESH_ENABLED === "false") return;

  schedulerStarted = true;
  const runRefresh = () => {
    refreshJobListings().catch((error) => {
      console.error("Job refresh failed:", error.message);
    });
  };

  runRefresh();
  const interval = setInterval(runRefresh, getRefreshIntervalMs());
  interval.unref?.();
};

module.exports = {
  getRefreshIntervalMs,
  getRefreshMetadata,
  refreshJobListings,
  startJobRefreshScheduler,
};
