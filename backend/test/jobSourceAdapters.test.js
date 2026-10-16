const test = require("node:test");
const assert = require("node:assert/strict");

const {
  fetchLeverSite,
  getConfiguredJobSources,
  isSafeExternalUrl,
  normalizeGreenhouseJob,
} = require("../services/jobSourceAdapters");

test("configured job sources accept only complete Greenhouse and Lever board entries", () => {
  const sources = getConfiguredJobSources({
    JOB_GREENHOUSE_BOARDS: JSON.stringify([
      { boardToken: "acme", company: "Acme" },
      { boardToken: "missing-company" },
    ]),
    JOB_LEVER_SITES: JSON.stringify([{ site: "example", company: "Example Inc." }]),
  });

  assert.deepEqual(
    sources.map((source) => ({ source: source.source, sourceKey: source.sourceKey, company: source.company })),
    [
      { source: "greenhouse", sourceKey: "greenhouse:acme", company: "Acme" },
      { source: "lever", sourceKey: "lever:example", company: "Example Inc." },
    ]
  );
});

test("Greenhouse normalization keeps source-provided fields and rejects unsafe application links", () => {
  const source = { sourceKey: "greenhouse:acme", company: "Acme" };
  const listing = normalizeGreenhouseJob(
    {
      id: 42,
      title: "Software Engineering Intern",
      location: { name: "Remote" },
      absolute_url: "https://boards.greenhouse.io/acme/jobs/42",
      updated_at: "2026-01-02T00:00:00.000Z",
      metadata: [
        { name: "Salary", value: "$25/hour" },
        { name: "Skills", value: "JavaScript, React" },
      ],
    },
    source,
    new Date("2026-01-03T00:00:00.000Z")
  );

  assert.equal(listing.type, "internship");
  assert.equal(listing.salary, "$25/hour");
  assert.deepEqual(listing.skills, ["JavaScript", "React"]);
  assert.equal(listing.publishedAt, null);
  assert.equal(listing.listingId, "greenhouse:acme:42");
  assert.equal(
    normalizeGreenhouseJob(
      { id: 43, title: "Unsafe", absolute_url: "javascript:alert(1)" },
      source,
      new Date()
    ),
    null
  );
});

test("Lever adapter paginates published postings and maps source dates", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const payload = calls.length === 1
      ? Array.from({ length: 100 }, (_, index) => ({
          id: `job-${index}`,
          text: "Engineer",
          hostedUrl: `https://jobs.example.com/${index}`,
          categories: { location: "Bengaluru", commitment: "Full-time" },
          createdAt: 1767225600000,
        }))
      : [
          {
            id: "job-final",
            text: "Product Intern",
            hostedUrl: "https://jobs.example.com/final",
            categories: { location: "Remote", commitment: "Internship" },
          },
        ];

    return { ok: true, json: async () => payload };
  };

  const listings = await fetchLeverSite(
    { identifier: "example", sourceKey: "lever:example", company: "Example Inc." },
    { fetchImpl }
  );

  assert.equal(calls.length, 2);
  assert.match(calls[1], /skip=100/);
  assert.equal(listings.length, 101);
  assert.equal(listings[0].publishedAt.toISOString(), "2026-01-01T00:00:00.000Z");
  assert.equal(listings.at(-1).type, "internship");
});

test("application URLs are limited to credential-free HTTP(S) URLs", () => {
  assert.equal(isSafeExternalUrl("https://careers.example.com/jobs/1"), true);
  assert.equal(isSafeExternalUrl("http://example.com/jobs/1"), true);
  assert.equal(isSafeExternalUrl("javascript:alert(1)"), false);
  assert.equal(isSafeExternalUrl("https://user:pass@example.com/jobs/1"), false);
});
