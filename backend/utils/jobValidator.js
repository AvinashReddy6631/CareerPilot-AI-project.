/**
 * Job Validation Utilities
 * Validates URLs, checks expiry, ensures data integrity
 */

const MAX_DAYS_OLD = 60; // Max 60 days before marking as expired

/**
 * Validates if a URL is properly formatted and not obviously broken
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL looks valid
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url); // Throws if invalid format
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if a job is expired based on days posted
 * @param {number} postedDaysAgo - Days since posting
 * @returns {boolean} - True if job is too old
 */
const isExpired = (postedDaysAgo) => {
  return postedDaysAgo > MAX_DAYS_OLD;
};

/**
 * Validates a job object has all required fields
 * @param {object} job - Job object to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validateJob = (job) => {
  const errors = [];

  if (!job) {
    return { valid: false, errors: ["Job object is missing"] };
  }

  // Check required fields
  if (!job.id || !job.id.trim()) errors.push("Missing job ID");
  if (!job.company || !job.company.trim()) errors.push("Missing company name");
  if (!job.role || !job.role.trim()) errors.push("Missing job role");
  if (!job.applyUrl || !job.applyUrl.trim()) errors.push("Missing apply URL");

  // Validate URL format
  if (job.applyUrl && !isValidUrl(job.applyUrl)) {
    errors.push("Invalid apply URL format");
  }

  // Check if expired
  if (job.postedDaysAgo !== undefined && isExpired(job.postedDaysAgo)) {
    errors.push(`Job expired (${job.postedDaysAgo} days old)`);
  }

  // Check for required arrays/fields
  if (!Array.isArray(job.skills)) errors.push("Skills must be an array");
  if (!job.location || !job.location.trim()) errors.push("Missing location");
  if (!job.source || !job.source.trim()) errors.push("Missing source");

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Filters jobs to remove invalid and expired ones
 * @param {array} jobs - Array of job objects
 * @returns {object} - { validJobs: array, invalidCount: number, expiredCount: number }
 */
const filterValidJobs = (jobs) => {
  let invalidCount = 0;
  let expiredCount = 0;
  const validJobs = [];

  for (const job of jobs) {
    // Skip if URL is invalid
    if (!isValidUrl(job.applyUrl)) {
      invalidCount++;
      continue;
    }

    // Skip if expired
    if (isExpired(job.postedDaysAgo)) {
      expiredCount++;
      continue;
    }

    validJobs.push(job);
  }

  return { validJobs, invalidCount, expiredCount };
};

/**
 * Enriches a job with validation metadata
 * @param {object} job - Job object
 * @returns {object} - Job with validation fields
 */
const enrichJobWithValidation = (job) => {
  return {
    ...job,
    isValid: isValidUrl(job.applyUrl),
    isExpired: isExpired(job.postedDaysAgo),
    validationStatus: {
      urlValid: isValidUrl(job.applyUrl),
      notExpired: !isExpired(job.postedDaysAgo),
      hasRequiredFields: !!(job.company && job.role && job.applyUrl),
    },
  };
};

module.exports = {
  isValidUrl,
  isExpired,
  validateJob,
  filterValidJobs,
  enrichJobWithValidation,
  MAX_DAYS_OLD,
};
