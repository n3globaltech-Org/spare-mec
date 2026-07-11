# SpareMec Storefront — Production Readiness (Single Source of Truth)

**Last updated:** 2026-07-09 · **Owner:** platform team · **Phase:** feature-complete → **staging validation & UAT**

_Re-baseline (2026-07-09): H2/H3 hardened at build time; hardcoded-slug risk de-risked; admin (Service Book) two-level nav redesign shipped. **Pre-launch scheduled-fixes batch complete** (storefront build green + backend 333 tests pass): SEO canonicals / facet-noindex / category `CollectionPage`+`BreadcrumbList` / favicon+OG+`Organization.logo`; product-404-vs-outage + category error-state robustness; backend Joi validation on catalog GET; removed fabricated ratings; wired `AvailabilityBadge`; checkout phone/email validation + "AED 0" fix + input a11y; global focus-ring + reduced-motion; dead-code cleanup; SSR timeout 20s→10s. **Deferred:** H4 images (Lighthouse-gated), PM2 rate-limiter (needs Redis), full per-element a11y contrast pass. Remaining hard gates (H1/H4/H5, CSP, functional UAT) still require the **staging environment** — infra + testing, below._

> Feature development is **paused**. From here we only fix issues surfaced by UAT or genuine
> production blockers. Everything else is scheduled post-launch. This doc is the team's shared
> checklist through cutover.

## Status at a glance

| Track | State |
|---|---|
| CRA→Next UI parity (incl. full homepage) | ✅ complete, 1:1 |
| Desktop homepage render bug | ✅ fixed & verified (desktop + mobile) |
| End-to-end review (17 dimensions) | ✅ complete |
| Launch blockers **H1, H5** | ✅ fixed & verified |
| Blocker **H2/H3** (build-env) | ✅ **hardened** — prod build now fails loudly if `NEXT_PUBLIC_API_URL` unset/invalid; still confirm in staging |
| Blocker **H4** (images) | ⏳ measure Lighthouse in staging (see register) |
| Hardcoded homepage/promo slugs | ✅ **non-issue** — only dead `defaultCategories` export; homepage is API-driven |
| Storefront build | ✅ green (18 routes) |
| Backend test suite | ✅ 333/333 passing |
| Admin (Service Book) navigation | ✅ **redesigned** — two-level nav (tenant + super-admin), config-driven; tsc + prod build green |
| Staging UAT | ⏳ **next step** (infra: deploy + migrations + tests) |

---

## 0. Mandatory deployment gates (EVERY environment — dev / staging / production)

Hard preconditions for bringing up or deploying **any** environment. No exceptions.

1. **DB migrations run FIRST, against the exact DB the API will connect to.** Provisioning order is always: create/point the DB → run migrations → start the app → seed. **Never start the app against an un-migrated DB.**
2. **`db:migrate:status` must report `0 pending` (no `down`) before the environment is considered up.** Wire this as an automated pre-deploy / CI check that fails the deploy on any pending migration.
3. **App-DB must equal migrated-DB.** `sequelize-cli` defaults to the `development` config (`DB_*` vars); the app uses the `production` config (`DATABASE_URL`) only when `NODE_ENV=production`. Confirm the connection string the API *boots with* is the one you migrated. **This exact mismatch caused the pre-UAT login 500 (`column …tenant.currency does not exist`)** — the dev DB was on the pre-Phase-0 schema.
4. **RDS/production migrations run ONLY at deploy time, after confirming the target DB** — never speculatively. _Current state: local dev DB migrated ✅ (0 pending); RDS **not** touched._
5. **`.env` is git-ignored and never committed; rotate any exposed DB credential.** _Verified 2026-07-09: `service-book-api/.gitignore` lists `.env`; `.env` is not git-tracked._

```bash
# Run against the target env, then confirm zero pending:
NODE_ENV=<development|production> npx sequelize-cli db:migrate
NODE_ENV=<development|production> npx sequelize-cli db:migrate:status   # expect: no "down" lines
```

Phase 0–4 = migrations `20260708000001`–`000011` (incl. `tenant.currency`, `orders`/`order_items`/`order_status_history`).
Plus `20260709000001-add-tenant-storefront-url.js` (adds `tenants.storefront_url`, nullable — powers the admin "Visit store" button). Not yet run anywhere; will land with the next `db:migrate` at staging deploy.

---

## 1. What shipped

**Homepage — 1:1 with CRA** (`src/components/home/`), original order: Hero → Shop-by-Category bento →
Featured carousel → Promo Banners → Trust Bar → Mechanic Banner → Brand marquees → Testimonials →
Brake Animation (mobile-only 240-frame) → FAQ preview.

**UI parity:** product cards (wishlist heart, rating, add-to-cart), PDP breadcrumbs + `BreadcrumbList`
JSON-LD, Navbar Categories mega-menu + mobile search, shared UI primitives ported.

**Hardening:** security headers (CSP w/ API origin in `connect-src`, HSTS, nosniff, frame, permissions;
`X-Powered-By` off), `Organization`+`WebSite` JSON-LD, GA4 (env-gated), Search Console meta (env-gated),
legacy 301 redirects, custom 404, sitemap.xml, robots.txt.

**Reliability fix (desktop bug):** framer-motion `opacity` entrance animations were sticking at
`opacity:0` in the prod SSR build (Hero blank on desktop, sections washed out). Entrance animations are
now **transform-only** (never gate visibility on opacity); the Hero is fully static (LCP-critical).
Verified: **0 stuck `opacity:0` elements**, full render on both viewports.

---

## 2. Findings register (from the E2E review)

Legend: ✅ fixed · ⏳ validate/decide in staging · 🕒 scheduled post-launch.

### Launch blockers (High)
| ID | Area | Finding | Status |
|---|---|---|---|
| **H1** | Security / tracking | Sequential `ORD-000001` IDs on the unauthenticated tracking endpoint let anyone enumerate & scrape the whole order book | ✅ **fixed** — order numbers now `ORD-<seq>-<8-char unguessable suffix>` (`order.service.js`), dedicated **track rate limiter** 30/min (`storefront.routes.js`, env `STOREFRONT_TRACK_RATE_LIMIT`), and public timeline reduced to **status+timestamp only** (dropped internal notes/invoice leak, `storefront.serializer.js`). 333 tests pass. |
| **H5** | Conversion | "Order on WhatsApp" called `window.open` **after** `await` → popup-blocked on Safari/Firefox (order created, WhatsApp never opened) | ✅ **fixed** — tab opened **synchronously in the click gesture** then pointed at the order link (`ProductActions.jsx`, `checkout/page.jsx`); checkout falls back to the confirmation page's WhatsApp button. **Must be re-verified on Safari/Firefox in staging.** |
| **H2** | Deploy | CSP `connect-src` is baked from `NEXT_PUBLIC_API_URL` **at build time**; if unset at build, the browser CSP blocks **all** client-side API calls | ✅ **hardened** — `next.config.js` now **throws on `PHASE_PRODUCTION_BUILD`** if `NEXT_PUBLIC_API_URL` is missing/invalid, so a broken deploy can't be produced (dev unaffected). Still confirm no CSP `connect-src` violations on the deployed origin in Phase A. |
| **H3** | Robustness | Missing/wrong `NEXT_PUBLIC_API_URL` at build silently ships an **empty** storefront (fetches fall back to localhost) | ✅ **hardened** — same build-time assertion (above) fails the build instead of shipping a localhost-fallback store. Verified: throws on prod build w/o the env, passes with it, dev still falls back to localhost. |
| **H4** | Performance | ~7MB of eagerly-loaded PNGs on the homepage (promo banners 4.7MB, category 4.5MB) + zero `next/image` | ✅ **done** — all 6 homepage images (Hero ×2, PromoBanners ×2, MechanicBanner, FeaturedProducts) converted to `next/image` with real intrinsic dimensions and `quality={90}` (no visual quality reduction — same source assets, only correctly-sized + modern-format delivery via Next's optimizer). Hero images `priority` (LCP); others lazy. Requires the `sharp` package for self-hosted optimization — **added as a dependency**. Storefront build verified green. Confirm the real-world LCP win with Lighthouse in staging. |

### Medium (schedule around launch)
| Area | Finding | Status |
|---|---|---|
| SEO | No canonical on `/`, `/catalogue`, `/track`; catalogue facets (`?q=/sort/page`) need canonical/noindex | ✅ **done** — canonicals on `/` & `/track` (`/catalogue` already had one); catalogue facet variants `noindex` + canonical-to-base. |
| SEO | Category pages soft-404 on invalid slug (200 + self-canonical) → should `notFound()` | ✅ **done** — API-aware `notFound()` (an outage is NOT turned into a 404); unknown slug `noindex`. |
| SEO | Category pages lack `CollectionPage`/`BreadcrumbList` structured data | ✅ **done** — both emitted on category pages. |
| SEO | No favicon, no default OG/Twitter image, `Organization` missing `logo` | ✅ **done** — `src/app/icon.svg` favicon, default OG/Twitter image, `Organization.logo`. (OG image is a placeholder asset — swap for a 1200×630 later.) |
| Robustness | API outage → product pages 404 (deindex risk); catalogue/category/wishlist show "empty" not "error" | ✅ **done** — product outage → 5xx (not a soft-404 that deindexes); category **and** catalogue now show a real error state vs. a misleading "empty". |
| Config | Hardcoded homepage/promo category slugs may not match live tenant slugs → empty category pages | ✅ **de-risked + cleaned** — homepage is API-driven; the only hardcoded slugs were an unused `defaultCategories` export, now **removed**. |
| Security (BE) | No Joi validation on catalog GET query params → non-UUID `categoryId` returns 500 w/ raw DB error | ✅ **done** — Joi query validation on `/catalog/products` + `/catalog/search` → clean **400**; **333 tests pass**. |
| Security (BE) | Storefront rate limiters use in-memory store → fragment across PM2 workers | 🕒 **deferred** — needs a shared store (Redis); infra decision, not a code-only fix. |
| Data (BE) | Order-number generation read-max+1 not concurrency-safe *(mitigated by H1's random suffix — collisions no longer fail an order)* | ✅ mitigated |
| A11y | Low contrast `text-neutral-400` on load-bearing text (~50 places); inputs placeholder-only (no `<label>`); `outline-none` kills focus ring; framer-motion ignores `prefers-reduced-motion` | ✅ **done** (pragmatic AA pass) — global `:focus-visible` ring + `prefers-reduced-motion` (CSS); framer-motion `useReducedMotion` in 5 entrance components (Reveal, ProductCard, PromoBanners, CategoryCard, MechanicBanner); 22 `text-neutral-400→-500` contrast bumps on load-bearing text; checkout `aria-label` + input types. Run axe/Lighthouse in staging to confirm; a few `outline-none` focus sites remain a minor follow-up. |
| Forms | No email/phone format validation before order → uncontactable CRM leads | ✅ **done** — checkout requires a valid phone (≥7 digits) + validates email format when present. |
| UX | Fake "4.5 (112)" rating on every card; checkout subtotal "AED 0" for price-on-request-only carts | ✅ **done** — fabricated ratings removed (stars only show with real data); price-on-request carts show "On request", not "AED 0". |
| Perf | 20s axios timeout on SSR → homepage up to ~40s TTFB on a slow API (shorten to 2–5s) | ✅ **done** — timeout 20s → 10s (kept ≥ order-POST safety on the shared instance). |
| Parity | `AvailabilityBadge` component built but unused (PDP shows plain text) | ✅ **done** — wired onto the PDP (green "In Stock" / neutral "Made to Order"). |

### Low + nice-to-have — **post-launch backlog**
`/wishlist` indexable-empty (noindex) · silent empty-submit on Track/Contact · `alert()` errors → inline ·
"Price on request" vs "Best price on request" wording · fragmented availability vocabulary · dead components
(`AvailabilityBadge`, `Grain`) · 3 search-input implementations · "24/7" copy vs actual hours · Product `Offer`
JSON-LD missing `url`/`priceValidUntil` · sitemap caps 500 products · no `error.jsx` boundary · quantity not
integer/bounded; `vehicle`/`delivery` unbounded JSON · anonymous intake no CAPTCHA · **nice-to-have:** port
ChatWidget bot, CMS promo banners, real reviews, `next/image` blur, connection-aware brake-animation opt-out.

### Confirmed strong (no action)
Server-side pricing (defense-in-depth `stripUnknown`) · complete tenant scoping · 404-not-403 tenant
resolution · PII-excluded public serializer · shared net-based tax engine · order state machine · admin routes
fully auth/permission/feature-gated & separated from public · all internal links resolve · all assets present ·
no secrets/PII logging/`console.*` · GA `anonymize_ip` + gated · defensive `mapProduct` · double-submit protection.

---

## 3. Environment

**Storefront (`NEXT_PUBLIC_*` — inlined at BUILD time, so must be correct in CI/Docker build):**

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Service Book public API base, e.g. `https://api.sparemec.ae/api` — **also feeds CSP `connect-src` (H2)** |
| `NEXT_PUBLIC_STORE_SLUG` | `sparemec` |
| `NEXT_PUBLIC_SITE_URL` | `https://sparemec.ae` (sitemap/canonical/JSON-LD) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | digits only |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_MEDIA_HOST` | optional (analytics / Search Console / image host allow-list) |

**Backend:** `sparemec` tenant with `storefront` feature ON, `storefront_slug='sparemec'`, currency AED,
VAT 5% registered. Rate limits: `STOREFRONT_RATE_LIMIT` (240), `STOREFRONT_ORDER_RATE_LIMIT` (20),
`STOREFRONT_TRACK_RATE_LIMIT` (30).

Deploy target: **Node runtime** (pages use `force-dynamic` SSR — not a static export).

> **`sharp` dependency (H4):** homepage images now go through `next/image`, which requires the
> native `sharp` package for self-hosted optimization (added to `package.json`). It's a prebuilt
> native binary — a standard `npm install`/`npm ci` on the deploy target's actual OS/arch (e.g. in
> the Docker build stage, not cross-compiled from a different host) resolves it correctly.

> **Build health note:** the `.next` build is flaky in the monorepo — killing a build mid-flight or building
> while `next start` runs corrupts it (`vendor-chunks/react-icons` / `_document PageNotFound`). Always
> `rm -rf .next` and rebuild clean; retry once on a transient `_document` error (it compiles fine).

---

## 4. Staging UAT runbook

### Phase A — Stand up staging (production-like)
- [ ] **DB migrations FIRST — apply to the exact DB the API will connect to.** `sequelize-cli` defaults to the `development` config (`DB_*` vars); the app uses `production` (`DATABASE_URL`) only when `NODE_ENV=production`. Run `NODE_ENV=<target> npx sequelize-cli db:migrate` then `db:migrate:status` and confirm **0 pending** (Phases 0–4 = migrations `20260708000001`–`000011`, incl. `tenant.currency`). ⚠️ Mismatch here is what caused the pre-UAT login 500 (`column …tenant.currency does not exist`): the app's DB was on the old schema. Verify the API's connection string points at the migrated DB, not a different one.
- [ ] Deploy Service Book API; seed `sparemec` with **real-ish catalog data** (products, categories, brands, prices, CDN images); feature/flag/currency/VAT as above.
- [ ] Build + deploy the storefront with prod env set **at build time**.
- [ ] **H2/H3 gate:** DevTools → Network/Console on the deployed site — client calls hit the real API, **no CSP `connect-src` violations**. If categories/cart/tracking work in-browser, H2/H3 pass. If CSP-blocked → rebuild with `NEXT_PUBLIC_API_URL` set.

### Phase B — Objective checks
- [ ] **Lighthouse** (mobile + desktop) on `/`, `/catalogue`, real `/product/<slug>`, `/checkout`. Targets: Perf ≥85 mobile / ≥95 desktop, A11y ≥95, Best-Practices ≥95, SEO 100.
- [ ] **H4 decision:** if mobile LCP < 2.5s, skip image work; if poor, convert the homepage PNGs → WebP/`next/image` (promo banners first).
- [ ] **CWV:** LCP < 2.5s, CLS < 0.1, INP < 200ms.
- [ ] **Rich Results** test: `/` (Organization/WebSite), product (Product+Offer+BreadcrumbList), `/faqs` (FAQPage).
- [ ] **Security headers:** `securityheaders.com` + CSP evaluator on the deployed origin.
- [ ] **H5 cross-browser gate:** on **Safari + Firefox**, "Order on WhatsApp" from PDP *and* checkout opens WhatsApp with the prefilled Order ID.

### Phase C — Functional UAT (live API + real data)
- [ ] Home populates from live API; all 10 sections render (desktop + real mobile devices).
- [ ] Search + filters + pagination; category pages correct. *(Hardcoded-slug risk de-risked — homepage is API-driven; only a dead `defaultCategories` export exists.)*
- [ ] PDP: AED / VAT-exclusive price, specs/fitment/related, breadcrumbs.
- [ ] Add to Cart → Checkout: **VAT line + total correct** → Place Order → real Order in Service Book → confirmation shows Order ID.
- [ ] **H1 gate:** Order ID is `ORD-<seq>-<suffix>`; track by it (no login); timeline = **status+timestamps only** (no internal notes/invoice #); a *guessed* number → 404; rapid requests trip the track rate limit.
- [ ] Order-on-WhatsApp creates a real Order + opens wa.me with the Order ID.
- [ ] **Phone-first matching:** repeat order, same phone → links to existing customer (admin check).
- [ ] Admin: order appears, staff-auth works, status transitions follow the shared vocabulary.
- [ ] Wishlist persists; legacy redirects 301; sitemap.xml + robots.txt serve; custom 404.

---

## 5. Go / No-Go criteria

**GO** requires ALL hard gates green:
0. **DB migrations (§0)** — `db:migrate:status` reports 0 pending on the **target** DB, and the API boots against that same migrated DB.
1. **H2/H3** — deployed site's client-side API calls work, no CSP block (Phase A).
2. **H5** — WhatsApp opens on Safari + Firefox from PDP and checkout (Phase B).
3. **H1** — unguessable Order IDs, no PII/notes leak, guessed IDs 404, rate limit trips (Phase C).
4. Full customer journey works end-to-end with real data; **VAT totals correct**.
5. Order intake + admin order flow + phone-first matching verified.
6. No **new** High/critical security or data issue found in UAT.

**Conditional GO:** H4 (images) may ship as a **fast-follow** if mobile LCP is only moderately over — with a scheduled fix, not a blocker. Medium SEO/a11y items are scheduled, not gating.

**NO-GO** if any hard gate fails, checkout/order intake is broken, CSP blocks client API, or a new critical surfaces.

---

## 6. Cutover & rollback
1. **Run DB migrations on the production DB and confirm 0 pending (§0)** before anything else; confirm the API's `DATABASE_URL` points at that migrated DB. Then confirm prod API reachable; `sparemec` `storefront` flag ON, `storefront_slug='sparemec'`.
2. Set env (§3); optionally tighten `NEXT_PUBLIC_MEDIA_HOST` + CSP to exact hosts.
3. Rename `apps/storefront` → `apps/storefront-cra-legacy`, `apps/storefront-next` → `apps/storefront`; point proxy/deploy at the Next app. **Keep the CRA build deployable.**
4. Submit sitemap in Search Console; monitor 404s + order flow for ~1 week.
5. **Rollback:** repoint the proxy to the retained CRA build (cheap; keep ~1 week).

## 7. After stable in production → Phase 5
Retire the legacy CRA storefront, retire **sm-api + MongoDB**, and infrastructure cleanup.

---

## 8. Intentional differences vs CRA (not regressions)
- **Customer auth / account dashboard** dropped — Service Book has no customer-auth API; `/account` is informational. Re-add when that API exists.
- **ChatWidget** (scripted bot) not ported — optional conversion add-on.
- **CMS promo banners** — static banners used (no public `/banners` endpoint yet).
- **Inquiry model → real cart + priced checkout + VAT** — deliberate upgrade.
