# TODO - Fix Career Roadmap Generation Logic

## Step 1: Inspect current roadmap controller
- [x] Read `backend/controllers/roadmapController.js` to identify hardcoded templates and selection logic.

## Step 2: Implement dynamic role-based roadmap system
- [ ] Add keyword-based role detection (Frontend/Backend/Full Stack/MERN/Data Analyst/Data Scientist/AI-ML/Python/DevOps).
- [ ] Create separate roadmap templates per role with unique topics/projects/certifications/milestones/timeline/readiness.
- [x] Remove frontend-only fallback behavior.
- [ ] Ensure response structure stays the same.
- [ ] Ensure roadmap title reflects matched role.
- [ ] Add comments explaining matching logic.

## Step 3: Add AI fallback when no role matches
- [ ] Generate custom roadmap dynamically for unknown roles using existing AI config.
- [ ] Ensure fallback still returns required structure.

## Step 4: Validate
- [ ] Run backend tests / start server and call `/roadmap/generate` for multiple roles.
- [ ] Manually verify returned roadmap stages differ per role.

