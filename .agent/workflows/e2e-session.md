---
description: End-to-end verification workflow to run after every coding session
---

# E2E Session Verification Workflow

// turbo-all

> **MANDATORY:** This workflow MUST be executed at the end of EVERY coding session before updating DAILYSTANDUP.md.

## Steps

1. **Build Check** — Verify TypeScript compilation
```bash
cd frontend && npx next build
```

2. **Backend Health Check** — Verify backend is responsive
```bash
curl -s http://localhost:4000/api/v1/health | head -20
```

3. **Browser E2E Smoke Test** — Visit key pages and verify no runtime errors
   - Open `http://localhost:3000` (Dashboard)
   - Navigate to each module changed in this session
   - Verify dropdowns load data (no empty selects)
   - Verify forms submit without console errors
   - Take screenshots of key pages

4. **API Integration Test** — Verify API endpoints respond correctly
```bash
# Test vendor list (used by VendorSelect)
curl -s http://localhost:4000/api/v1/vendors?limit=5 | head -10

# Test contract list (used by ContractSelect)
curl -s http://localhost:4000/api/v1/contracts?limit=5 | head -10
```

5. **Update DAILYSTANDUP.md** — Add E2E results to session entry
   - Build status (pass/fail)
   - Pages verified
   - Issues found (if any)

## Failure Protocol

- If build fails → Fix before ending session
- If API returns errors → Document in DAILYSTANDUP with error details
- If UI has runtime errors → Fix critical ones, document non-critical

## Session Completion Checklist

- [ ] `npx next build` passes with 0 errors
- [ ] Backend API responds to health check
- [ ] Changed pages render correctly in browser
- [ ] Forms with new components work (dropdowns populate, submit works)
- [ ] DAILYSTANDUP.md updated with E2E results
- [ ] task.md updated with progress
