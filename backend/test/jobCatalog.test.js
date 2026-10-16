const test = require("node:test");
const assert = require("node:assert/strict");

const JobListing = require("../models/JobListing");
const { searchJobs } = require("../utils/jobCatalog");

const searchWithFilters = async (searchOptions) => {
  const originalCountDocuments = JobListing.countDocuments;
  const originalFind = JobListing.find;
  let filters;

  JobListing.countDocuments = (value) => {
    filters = value;
    return Promise.resolve(1);
  };
  JobListing.find = (value) => {
    filters = value;
    return {
      sort: () => ({
        skip: () => ({
          limit: () => ({ lean: async () => [] }),
        }),
      }),
    };
  };

  try {
    await searchJobs(searchOptions);
    return filters;
  } finally {
    JobListing.countDocuments = originalCountDocuments;
    JobListing.find = originalFind;
  }
};

test("cached active listings remain discoverable without configured board keys", async () => {
  const filters = await searchWithFilters({ type: "job", sources: ["greenhouse", "lever"] });

  assert.equal(filters.status, "active");
  assert.deepEqual(filters.source, { $in: ["greenhouse", "lever"] });
  assert.equal(Object.hasOwn(filters, "sourceKey"), false);
});

test("job search applies only the supplied optional keyword and location filters", async () => {
  const locationOnly = await searchWithFilters({ location: "Hyderabad" });
  assert.equal(locationOnly.$and.length, 1);
  assert.match(locationOnly.$and[0].location.source, /hyderabad/);

  const keywordOnly = await searchWithFilters({ query: "Frontend Developer" });
  assert.equal(keywordOnly.$and.length, 2);

  const combined = await searchWithFilters({
    query: "Frontend Developer",
    location: "Hyderabad",
    sourceKeys: ["greenhouse:example"],
  });
  assert.equal(combined.$and.length, 3);
  assert.deepEqual(combined.sourceKey, { $in: ["greenhouse:example"] });
});
