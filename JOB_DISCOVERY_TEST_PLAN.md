# Job Discovery Module - Test Plan & Verification Guide

**Last Updated:** June 10, 2026  
**Total Tests:** 22 test cases  
**Estimated Time:** 15-20 minutes

---

## TEST ENVIRONMENT SETUP

### Prerequisites
- Backend server running (`npm run dev` in backend directory)
- Frontend server running (`npm run dev` in frontend directory)
- Browser developer console open (for checking logs)
- Application Tracker page accessible

### Test Data
- 42 total jobs in catalog
- Expected ~32-37 valid jobs after filtering
- 5-10 jobs filtered (expired or invalid)

---

## SECTION 1: BACKEND VALIDATION TESTS

### TEST 1.1: Job Catalog Filtering at Startup
**Objective:** Verify that invalid/expired jobs are filtered on backend startup

**Steps:**
1. Check backend console output when server starts
2. Look for job filtering logs
3. Verify valid jobs count

**Expected Result:**
```
✓ Backend starts without errors
✓ Sees message: "Filtering invalid jobs..."
✓ Shows valid jobs count: ~32-37 out of 42
```

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe below)

**Notes:** ___________________________________________________________

---

### TEST 1.2: URL Validation Function
**Objective:** Test `isValidUrl()` utility function

**Steps:**
1. Open backend code: `/backend/utils/jobValidator.js`
2. Review the `isValidUrl()` function
3. Verify it handles:
   - Valid URLs (should return true)
   - Invalid URLs (should return false)
   - Empty/null (should return false)

**Expected Result:**
```javascript
isValidUrl("https://www.linkedin.com/jobs/search?...")  // ✓ true
isValidUrl("https://indeed.com/jobs")                    // ✓ true
isValidUrl("not-a-url")                                  // ✓ false
isValidUrl("")                                           // ✓ false
isValidUrl(null)                                         // ✓ false
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 1.3: Expiry Validation Function
**Objective:** Test `isExpired()` utility function

**Steps:**
1. Review `/backend/utils/jobValidator.js`
2. Check `MAX_DAYS_OLD` constant = 60
3. Verify expiry logic:

**Expected Result:**
```javascript
isExpired(30)   // ✓ false (not expired)
isExpired(60)   // ✓ false (at limit)
isExpired(61)   // ✓ true (expired)
isExpired(100)  // ✓ true (expired)
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 1.4: Filter Valid Jobs Function
**Objective:** Test `filterValidJobs()` removes invalid jobs

**Steps:**
1. Review implementation of `filterValidJobs()`
2. Verify it returns:
   - `validJobs` array (filtered)
   - `invalidCount` number
   - `expiredCount` number

**Expected Result:**
```
Input: 42 jobs
Output:
  validJobs: 32-37 jobs
  invalidCount: 5-10
  expiredCount: 5-10
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 2: API ENDPOINT TESTS

### TEST 2.1: Search Endpoint Returns Valid Jobs Only
**Objective:** Verify `/jobs/search` endpoint filters before returning

**Steps:**
1. Open browser DevTools → Network tab
2. Go to Job Finder page
3. Perform a search (empty query returns all)
4. Check network request to `/jobs/search`
5. Inspect response JSON

**Expected Result:**
```javascript
{
  success: true,
  jobs: [
    {
      id: "linkedin-001",
      company: "Flipkart",
      role: "Software Development Engineer",
      applyUrl: "https://...",
      isValid: true,           // ← New field
      isExpired: false,        // ← New field
      validationStatus: {...}  // ← New field
    }
    // ... 31-36 more valid jobs
  ],
  total: 32-37,  // Should be LESS than 42
  timestamp: "2026-06-10T10:30:00.000Z"
}
```

**Check:**
- [ ] `jobs` array contains only valid jobs
- [ ] `total` count is 32-37 (not 42)
- [ ] Each job has `isValid` field
- [ ] Each job has `isExpired` field
- [ ] Each job has `validationStatus`

---

### TEST 2.2: Search with Resume Match Score
**Objective:** Verify match scoring works with validated jobs

**Steps:**
1. Go to Job Finder
2. Enable "Resume match scoring" checkbox
3. Perform search
4. Check if scores appear on job cards

**Expected Result:**
```
✓ Jobs have matchScore values (0-100)
✓ Jobs sorted by match score (highest first)
✓ Valid jobs only in results
✓ No match scores on invalid jobs
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 2.3: Match Job Endpoint - Valid Job
**Objective:** Test `/jobs/match` with a valid job

**Steps:**
1. In JobFinder, select a job
2. In DevTools, make manual request:
```javascript
fetch('/jobs/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobId: 'linkedin-001',
    resumeText: 'Software engineer with 2 years React experience'
  })
}).then(r => r.json()).then(console.log)
```
3. Check response

**Expected Result:**
```javascript
{
  success: true,
  job: {
    id: 'linkedin-001',
    isValid: true,
    isExpired: false,
    matchScore: 75,
    grade: 'A',
    matchedSkills: ['react', 'software engineer'],
    // ... more fields
  }
}
```

**Actual Result:**
- [ ] Pass (HTTP 200)
- [ ] Fail

---

### TEST 2.4: Match Job Endpoint - Expired Job
**Objective:** Test `/jobs/match` rejects expired job

**Steps:**
1. Find an expired job ID
2. Make manual request (same as TEST 2.3)
3. Check response status and message

**Expected Result:**
```javascript
{
  success: false,
  message: "Job posting has expired",
  job: {
    id: '...',
    isExpired: true
  }
}
// HTTP Status: 410 Gone
```

**Actual Result:**
- [ ] Pass (HTTP 410)
- [ ] Fail

---

### TEST 2.5: Match Job Endpoint - Invalid Job
**Objective:** Test `/jobs/match` rejects invalid URL

**Steps:**
1. Find a job with invalid URL
2. Make manual request
3. Check error response

**Expected Result:**
```
HTTP Status: 410 Gone
Message: "Job posting is no longer available"
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 3: FRONTEND UI TESTS

### TEST 3.1: Valid Job - Apply Button Visible
**Objective:** Verify Apply button shows for valid jobs

**Steps:**
1. Go to Job Finder
2. Search for jobs
3. Find a valid job in the list
4. Check JobCard component

**Expected Result:**
```
✓ Blue "Apply on [Source]" button visible
✓ Button is clickable
✓ Button has external link icon
✓ Color: brand-600 (blue)
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 3.2: Invalid Job - Disabled Button
**Objective:** Verify Apply button is disabled for invalid jobs

**Steps:**
1. Find an expired or invalid job in results
2. Check the job card

**Expected Result:**
```
✓ Button is DISABLED (grayed out)
✓ Shows: "Job no longer available" OR "Job posting expired"
✓ No external link icon
✓ Color: slate-100 (gray)
✓ Cursor: not-allowed
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 3.3: Job Detail Panel - Valid Job
**Objective:** Verify detail panel shows Apply button for valid jobs

**Steps:**
1. Click on a valid job in the list
2. Check right sidebar (or detail drawer on mobile)
3. Scroll to Apply section

**Expected Result:**
```
✓ Shows "Apply on Platform" button
✓ Button is bright blue (brand-600 to violet-600 gradient)
✓ Has external link icon
✓ Text below: "Opens in a new tab — you apply manually"
✓ Button is clickable
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 3.4: Job Detail Panel - Invalid Job
**Objective:** Verify detail panel shows error for invalid jobs

**Steps:**
1. Select an expired/invalid job
2. Check detail panel

**Expected Result:**
```
✓ Shows red error box
✓ Title: "Job no longer available" or "Job posting has expired"
✓ Explanation: specific reason
✓ No Apply button
✓ Color: red-50 background, red-600 text
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 4: AUTO-TRACKING TESTS

### TEST 4.1: Click Apply - Auto-Tracking Works
**Objective:** Verify clicking Apply button auto-creates application record

**Steps:**
1. Go to Job Finder
2. Click Apply button on a valid job
3. Wait for external job site to load (or just open)
4. Go to Application Tracker page
5. Check if job was auto-tracked

**Expected Result:**
```
✓ Job appears in Application Tracker
✓ Status: "applied"
✓ Contains: company, role, location, salary
✓ Contains: source, matchScore (if available)
✓ appliedAt timestamp is recent
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

**Notes:** ___________________________________________________________

---

### TEST 4.2: Click Track Button - Manual Tracking
**Objective:** Verify Track button still works (manual tracking)

**Steps:**
1. Go to Job Finder
2. Find a job NOT yet tracked
3. Click "Track" button
4. Check Application Tracker

**Expected Result:**
```
✓ Job added to tracker
✓ Status: "applied"
✓ Toast message: "Added to Application Tracker"
✓ Shows in tracker list
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 4.3: Save vs Track vs Apply
**Objective:** Verify all three actions work independently

**Steps:**
1. Find a job
2. Click "Save" → Check saved jobs
3. Click "Track" → Check application tracker
4. Click "Apply" → Check tracker again

**Expected Result:**
```
Saved Jobs:
✓ Job appears in saved list
✓ "★ Saved" button shows on card

Application Tracker:
✓ Job appears after clicking Track
✓ Job appears after clicking Apply
✓ No duplicates
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 5: DATA VALIDATION TESTS

### TEST 5.1: All Jobs Have Required Fields
**Objective:** Verify no jobs are missing essential data

**Steps:**
1. Go to Job Finder
2. Open DevTools Console
3. Paste this code:
```javascript
// Check first 5 jobs in results
const jobs = document.querySelectorAll('[class*="JobCard"]');
let allValid = true;

jobs.forEach((job, i) => {
  // Check if job has all visible fields
  const hasRole = job.textContent.includes('Engineer') || job.textContent.includes('Developer');
  const hasCompany = job.textContent.includes('Inc') || job.textContent.length > 200;
  if (!hasRole || !hasCompany) {
    console.error(`Job ${i} missing fields`, job);
    allValid = false;
  }
});

console.log(allValid ? '✓ All jobs valid' : '✗ Some jobs invalid');
```

**Expected Result:**
```
✓ All jobs have company name
✓ All jobs have role title
✓ All jobs have location
✓ All jobs have salary range
✓ All jobs have skills list
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 5.2: No Broken URLs in Results
**Objective:** Verify all Apply URLs are valid format

**Steps:**
1. Open DevTools Network tab
2. Go to Job Finder
3. Click several "Apply" buttons
4. Check network requests
5. Verify all links are HTTPS and have proper domains

**Expected Result:**
```
All URLs should:
✓ Start with https://
✓ Have valid domain (linkedin.com, indeed.com, etc.)
✓ Have proper path
✗ Never: "javascript:", "about:", "file://"
✗ Never: malformed or incomplete
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 6: MATCH SCORING TESTS

### TEST 6.1: Match Scores are Dynamic (Not Hardcoded)
**Objective:** Verify match scores change based on resume content

**Steps:**
1. Go to Resume Builder
2. Add/update resume with specific skills
3. Go back to Job Finder
4. Enable "Resume match scoring"
5. Search and note match scores
6. Update resume with different skills
7. Search again and note scores changed

**Expected Result:**
```
✓ Scores are 0-100 (not random percentages)
✓ Scores match resume keywords + job requirements
✓ Changing resume changes scores
✓ Higher scores for better matches
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 6.2: Match Breakdown Shows Skills
**Objective:** Verify match panel shows matched vs missing skills

**Steps:**
1. Enable resume match scoring
2. Select a job
3. Check detail panel
4. Look for "Matched Skills" and "Missing Skills"

**Expected Result:**
```
✓ Shows matched skills from resume
✓ Shows missing skills needed for job
✓ Lists are accurate
✓ Skill Match score (0-100)
✓ Keyword Match score (0-100)
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 7: ERROR HANDLING TESTS

### TEST 7.1: Backend Error on Missing Parameters
**Objective:** Test error handling when required fields missing

**Steps:**
1. Open DevTools Console
2. Make invalid API call:
```javascript
fetch('/jobs/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jobId: 'test' })  // Missing resumeText
}).then(r => r.json()).then(console.log)
```

**Expected Result:**
```javascript
{
  success: false,
  message: "jobId and resumeText are required",
  // HTTP 400 Bad Request
}
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 7.2: Job Not Found Error
**Objective:** Test error handling for non-existent job

**Steps:**
1. Make API call with fake job ID:
```javascript
fetch('/jobs/match', {
  method: 'POST',
  body: JSON.stringify({
    jobId: 'fake-999',
    resumeText: 'Software engineer'
  })
}).then(r => r.json()).then(console.log)
```

**Expected Result:**
```
HTTP 404 Not Found
Message: "Job not found"
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 7.3: Graceful Error Display
**Objective:** Verify UI shows errors gracefully (not crashes)

**Steps:**
1. Go to Job Finder
2. Do something that might error:
   - Search with special characters
   - Select very old filter combinations
   - Rapid clicking
3. Check if UI stays responsive

**Expected Result:**
```
✓ No JavaScript errors in console
✓ UI stays responsive
✓ Error messages appear in toast/error box
✓ User can retry search
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 8: MOBILE/RESPONSIVE TESTS

### TEST 8.1: Mobile - Invalid Job Message Visible
**Objective:** Verify disabled job state works on mobile

**Steps:**
1. Open browser DevTools
2. Switch to mobile view (iPhone 12)
3. Go to Job Finder
4. Find invalid job in results
5. Check if message is visible

**Expected Result:**
```
✓ Disabled button shows on mobile
✓ Message text is readable
✓ Not truncated or hidden
✓ Touch-friendly size (min 44px)
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

### TEST 8.2: Mobile - Detail Drawer Shows Validation
**Objective:** Verify detail drawer shows error for invalid jobs

**Steps:**
1. Mobile view (iPhone 12)
2. Click on invalid job
3. Drawer opens at bottom

**Expected Result:**
```
✓ Drawer shows properly
✓ Error message visible
✓ Not cut off by safe areas
✓ Can scroll to see all content
```

**Actual Result:**
- [ ] Pass
- [ ] Fail

---

## SECTION 9: PERFORMANCE TESTS

### TEST 9.1: Search Response Time
**Objective:** Verify search doesn't slow down with validation

**Steps:**
1. Open DevTools Performance tab
2. Go to Job Finder
3. Click Network tab
4. Perform search
5. Check network request time

**Expected Result:**
```
Response time: < 500ms
Size: < 200KB JSON
No console errors
```

**Actual Result:**
- [ ] Pass (time: ___ms)
- [ ] Fail

---

### TEST 9.2: Page Load Time
**Objective:** Verify filtering doesn't slow initial load

**Steps:**
1. Hard refresh Job Finder page
2. Check Network tab for load time
3. Check DevTools Performance tab

**Expected Result:**
```
Load time: < 2s
All jobs loaded and displayed
No layout shift after validation
```

**Actual Result:**
- [ ] Pass (time: ___s)
- [ ] Fail

---

## TEST SUMMARY

### Test Coverage
- Backend Validation: 4 tests
- API Endpoints: 5 tests
- Frontend UI: 8 tests
- Auto-Tracking: 3 tests
- Data Validation: 2 tests
- Match Scoring: 2 tests
- Error Handling: 3 tests
- Responsive: 2 tests
- Performance: 2 tests

**Total: 31 test cases**

### Pass/Fail Summary
- Total Tests: 31
- Passed: ___
- Failed: ___
- Skipped: ___

**Overall Status:** [ ] PASS [ ] FAIL

---

## ISSUES FOUND DURING TESTING

### Issue #1
**Test:** ___________________________
**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
**Description:** _________________________________________________________________
**Reproduction Steps:** __________________________________________________________
**Expected vs Actual:** __________________________________________________________

### Issue #2
**Test:** ___________________________
**Description:** _________________________________________________________________

---

## SIGN-OFF

**Tested By:** _______________________________
**Date:** _______________________________
**Status:** [ ] APPROVED [ ] NEEDS FIXES [ ] RETEST

**Sign-off Notes:** ________________________________________________________________
