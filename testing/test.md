# Passed checks and testing
 
**Environment:** Windows PowerShell, Node.js 24.20.0, npm 11.19.0  
**Website:** https://comp4050-bionic-portal-blush.vercel.app/

## What we tested

This is a summary of the passed checks: frontend and backend automated tests, a production build, and manual checks on the deployed site. Results apply to the scenarios and environments listed below.

The frontend tests were already in the team's repository. We Added the backend test package, performed the manual checks and recorded the results and collected logs. 

## 1. Automated tests

| Test file | Scope | Result |
| --- | --- | --- |
| `../web/src/App.test.jsx` | Login/loading screens, unauthenticated route protection, role navigation and route access, unknown-route redirects | 17 passed |
| `backend/security.test.js` | Password rules and role middleware | 14 passed |
| `backend/api.test.js` | Authentication handlers, order validation, draft/pack/edit/repack flow, ownership checks and error handling | 29 passed |
| `backend/management.test.js` | Role-management and carton routes, permissions, validation and catalogue changes | 28 passed |
| `backend/solver.test.js` | Solver adapter input/output conversion, unit expansion, dimensions, positions and IDs | 12 passed |

**Reported automated checks: 100 passed — 17 frontend and 83 backend.** Frontend run duration: 9.31 seconds. Backend run duration: 990 milliseconds.

The backend API tests run real Express route handlers and middleware with isolated Supabase and persistence doubles. Storage is simulated in memory, and packing responses are controlled in route tests. Solver tests exercise adapter conversion logic. These tests do not require production credentials and do not establish that live database policies or every production route have been verified.

The backend tests include simulated error conditions to check validation and cleanup. These cases passed. The original terminal logs are included for reproducibility.

Original outputs: [frontend](results/frontend-baseline.txt), [backend](results/backend-tests.txt), [environment](results/baseline-environment.txt).

## 2. Deployed order workflow

**Result: PASS for the tested Supervisor-to-Operator scenario.**

A Supervisor created and packed order `BZ-ONLINE-20261029-01` using the following input:

| Item | Width (X) | Depth (Y) | Length (Z) | Weight per unit | Quantity |
| --- | --- | --- | --- | --- | --- |
| BZ-ONLINE-A | 50 mm | 30 mm | 80 mm | 0.20 kg | 2 |
| BZ-ONLINE-B | 40 mm | 20 mm | 60 mm | 0.30 kg | 1 |

1. Sign in as Supervisor and create the order with two item rows.
2. Save and pack the order using the available cartons.
3. Check the summary and 3D item details against the input.
4. Refresh the order page and check that the packed result remains.
5. Sign in as Operator and open the same order.

Observed result: **packed**, three units placed in **one SML carton**, zero unpacked units, total weight **0.70 kg**. The 3D view showed two A units and one B unit with the submitted dimensions. The page displayed a solver computation time of **138 ms**; this is not a measurement of total page load time.

We confirmed that the result remained after refreshing. The Operator could view the order, with no Re-pack or edit-items controls shown. This last check verifies the page's role-based controls; backend authorization is covered separately within the stated automated-test scope.

## 3. Usability, mobile layout and browser checks

| ID | Method and scope | Observed result |
| --- | --- | --- |
| M01 | Chrome responsive viewport, 390 × 844: Dashboard navigation and cards | PASS — navigation and page scrolling worked |
| M02 | Same viewport: Orders and New Order | PASS — controls were accessible; wide tables/forms could be scrolled horizontally to reach remaining columns |
| M03 | Same viewport: packed order and Visualiser | PASS — drag rotation, zoom buttons, Reset View and item selection worked |
| M04 | Desktop New Order: Tab, Shift+Tab, text entry and Enter on Add Item Row | PASS — focus was visible, navigation worked and a row could be added |
| M05 | Microsoft Edge: login, Dashboard/Orders navigation, New Order entry/add row, existing packed order and 3D controls | PASS — tested actions worked |

The mobile checks used browser emulation, not a physical phone. Browser compatibility checks covered Chrome and Edge for the listed actions. Keyboard checks covered the New Order page. 

## 4. Reliability checks

| ID | Steps | Result |
| --- | --- | --- |
| R01 | Refresh an existing packed order, then open its direct URL in a new tab | PASS — the session and order result were available |
| R02 | Set DevTools Network to Offline and load Orders | PASS for error visibility — the page displayed `Failed to fetch` |
| R03 | Restore No throttling and manually refresh | PASS for manual recovery — all 10 orders returned and the user remained signed in |
| R04 | Refresh the newly packed online order | PASS — its packed result persisted |

Recovery required a manual refresh. These checks demonstrate the observed recovery path, not automatic retry or offline operation.

## 5. Performance and accessibility measurement

One Lighthouse **desktop Navigation** run was recorded on the deployed `/dashboard` page.

| Measurement | Recorded value |
| --- | --- |
| Performance score | 97 / 100 |
| Accessibility score | 100 / 100 |
| First Contentful Paint | 0.8 s |
| Largest Contentful Paint | 1.0 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0.003 |
| Speed Index | 1.3 s |

These are results from one page and one run. The accessibility score refers to Lighthouse's automated checks.

## 6. Build and backend dependency check

**Frontend production build: PASS.** Vite 6.4.5 transformed 49 modules and completed in **1.21 seconds**. Production output was generated successfully.

**Backend dependency audit:** `npm --prefix server audit` reported **0 vulnerabilities** at the time of this run.

Outputs: [build](results/frontend-build.txt), [backend audit](results/server-audit.txt).

## 7. How this supports the NFR task

| NFR checklist area | Evidence from this session |
| --- | --- |
| Mobile-first design | Responsive-layout checks at 390 × 844; evidence of the tested layout, not proof of the design methodology |
| Usability | Navigation, scrolling, item entry and 3D interactions |
| Accessibility | New Order keyboard checks and Dashboard Lighthouse result |
| Performance | Dashboard Lighthouse measurements and recorded packing computation time |
| Reliability | Refresh persistence and manual recovery after restoring the network |
| Security | Password/role tests, route authorization cases and backend dependency scan, within their stated scope |
| Browser compatibility | Selected workflows in Chrome and Edge |
| Maintainable and extensible code | Separate test files and repeatable commands support future regression checks; no general maintainability rating is assigned |
| Integration consistency | Solver adapter tests and the deployed create → pack → 3D display scenario |
| Automated testing | Existing frontend suite rerun and new backend suite added |

## 8. Test files and running instructions

All new test code, configurations and results for this report are in `testing/`:

| Location | Contents |
| --- | --- |
| `backend/` | Four backend test files, containing 83 cases |
| `frontend/App.test.jsx` | Entry point that imports the team's existing 17 frontend tests from `web/src/App.test.jsx` |
| `vitest.backend.config.mjs` | Backend test selection and dependency resolution |
| `vitest.frontend.config.mjs` | Frontend test selection using the existing Vite configuration |
| `run-tests.mjs` | Runs either suite using the corresponding application's installed Vitest |
| `results/` | Original logs for the checks reported here |

Keep the `testing` folder at the repository root, beside `server` and `web`. The original frontend test file stays in place so existing team CI can continue to use it. The entry point in this folder runs that same file without duplicating its test cases.

From the repository root, after installing the application's frontend and backend dependencies:

```powershell
# Backend test dependency, if not already installed
npm.cmd --prefix server install --save-dev --save-exact vitest@4.1.12

# Run the suites from this testing folder
npm.cmd --prefix testing test
npm.cmd --prefix testing run test:frontend

# Other recorded checks
npm.cmd --prefix web run build
npm.cmd --prefix server audit
```

The testing package reuses dependencies from `server/node_modules` and `web/node_modules`; it does not need its own dependency installation. The recorded Windows runs used frontend Vitest 3.2.7 and backend Vitest 4.1.12. Moving the backend tests into this folder changes import paths, not the assertions. The new layout was also checked in a separate review environment: 83 backend and 17 frontend cases passed (Vitest 4.1.12 in that environment).

Clicks, scrolling, keyboard use and refresh recovery were confirmed manually by us.
