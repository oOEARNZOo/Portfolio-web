# Portfolio Focused Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the portfolio's local workflow, accessibility, responsive reliability, theme behavior, metadata, and image delivery without changing its core visual design.

**Architecture:** Keep the existing static HTML, CSS, and JavaScript structure and serve it through Vite. Add lightweight source-contract tests with Node's built-in test runner, then verify real browser behavior through the local Vite server. Optimize only large raster assets and retain original files as fallbacks.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js test runner, Vite, FFmpeg WebP encoding, in-app browser validation.

---

## File Structure

- Create `.gitignore`: ignore dependency, build, environment, log, and local editor artifacts.
- Modify `package.json`: add project metadata and `dev`, `build`, `preview`, and `test` scripts.
- Modify `package-lock.json`: record the installed Vite dependency.
- Create `tests/portfolio.test.mjs`: source-contract tests for tooling, metadata, accessibility, responsive CSS, and optimized assets.
- Modify `index.html`: improve metadata, semantic states, responsive image markup, and script loading.
- Modify `style.css`: improve touch targets, overflow containment, focus behavior, theme integration, and visual restraint.
- Modify `type.js`: preserve hashes, expose active navigation state, synchronize theme metadata, and respect system preference.
- Create selected `Pictures/*.webp` assets: optimized alternatives for the largest visible raster images.

### Task 1: Add the Vite workflow and test harness

**Files:**
- Create: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/portfolio.test.mjs`

- [ ] **Step 1: Write the failing tooling contract test**

Create `tests/portfolio.test.mjs` with:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("project provides a complete Vite workflow", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const gitignore = await read(".gitignore");

  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(packageJson.scripts.preview, "vite preview");
  assert.equal(packageJson.scripts.test, "node --test tests/*.test.mjs");
  assert.ok(packageJson.devDependencies.vite);
  assert.match(gitignore, /^node_modules\/$/m);
  assert.match(gitignore, /^dist\/$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `node --test tests/portfolio.test.mjs`

Expected: FAIL because `.gitignore` does not exist and the Vite scripts are absent.

- [ ] **Step 3: Add the ignore rules and package metadata**

Create `.gitignore` with:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
```

Update `package.json` to contain the existing `impeccable` dependency plus:

```json
{
  "name": "chanatip-portfolio",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test tests/*.test.mjs"
  },
  "devDependencies": {
    "impeccable": "^2.3.2"
  }
}
```

Install Vite and update the lockfile with:

```powershell
npm.cmd install --save-dev vite
```

- [ ] **Step 4: Verify tooling tests and the production build**

Run: `npm.cmd test`

Expected: PASS with 1 test and 0 failures.

Run: `npm.cmd run build`

Expected: Vite exits with code 0 and writes `dist/index.html` plus referenced assets.

- [ ] **Step 5: Commit the tooling change when Git write access is available**

```powershell
git add .gitignore package.json package-lock.json tests/portfolio.test.mjs
git commit -m "build: add Vite workflow"
```

### Task 2: Improve metadata and accessible markup

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `index.html`

- [ ] **Step 1: Add failing metadata and accessibility assertions**

Append this test:

```js
test("document exposes accessible navigation and complete known metadata", async () => {
  const html = await read("index.html");

  assert.match(html, /<meta name="author" content="Chanatip Tonngern">/);
  assert.match(html, /<meta property="og:image:alt"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /<main id="main" tabindex="-1">/);
});
```

- [ ] **Step 2: Run the test and verify it fails on missing markup**

Run: `npm.cmd test`

Expected: FAIL on the first missing author metadata assertion.

- [ ] **Step 3: Add known metadata without inventing a canonical URL**

Add these elements in `<head>` and update the existing theme color to the light palette value:

```html
<meta name="author" content="Chanatip Tonngern">
<meta name="theme-color" content="#edf5fb">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Chanatip Tonngern Portfolio">
<meta property="og:image:alt" content="Preview of Chanatip Tonngern's front-end developer portfolio">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Chanatip Tonngern | Front-End Developer Portfolio">
<meta name="twitter:description" content="Selected front-end projects, technical skills, engineering background, and contact details.">
<meta name="twitter:image" content="./Pictures/portfolio_cover.jpg">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Chanatip Tonngern",
  "jobTitle": "Front-End Developer",
  "email": "mailto:chanatiptonngern@gmail.com",
  "sameAs": [
    "https://github.com/oOEARNZOo",
    "https://www.linkedin.com/in/chanatip-tonngern-698941364/"
  ]
}
</script>
```

- [ ] **Step 4: Add initial navigation state and focusable main content**

Change the first navigation link and main element to:

```html
<li><a href="#home" aria-current="page">Home</a></li>
<main id="main" tabindex="-1">
```

Add a polite state description to the theme control:

```html
<span class="sr-only" id="theme-status" aria-live="polite">Light theme active</span>
```

Connect the button with `aria-describedby="theme-status"` while retaining its existing `aria-label` and `aria-pressed` state.

- [ ] **Step 5: Run tests and validate HTML references through Vite build**

Run: `npm.cmd test`

Expected: PASS with 2 tests and 0 failures.

Run: `npm.cmd run build`

Expected: exit code 0 with no missing local asset errors.

- [ ] **Step 6: Commit the markup change when Git write access is available**

```powershell
git add index.html tests/portfolio.test.mjs
git commit -m "feat: improve portfolio metadata and semantics"
```

### Task 3: Correct theme and hash navigation behavior

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `type.js`
- Modify: `index.html`

- [ ] **Step 1: Add failing source contracts for theme and hash state**

Append this test:

```js
test("enhancement script synchronizes system theme, URL hash, and ARIA state", async () => {
  const script = await read("type.js");

  assert.match(script, /prefers-color-scheme: dark/);
  assert.match(script, /history\.pushState/);
  assert.match(script, /aria-current/);
  assert.match(script, /theme-color/);
  assert.match(script, /theme-status/);
  assert.match(script, /hashchange/);
});
```

- [ ] **Step 2: Run the test and verify it fails on system theme support**

Run: `npm.cmd test`

Expected: FAIL because `type.js` does not query `prefers-color-scheme: dark`.

- [ ] **Step 3: Update theme initialization and state synchronization**

In `initTheme`, derive the first theme from storage or the system preference:

```js
const media = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem(storageKey);
const initialDark = savedTheme ? savedTheme === "dark" : media.matches;
```

Extend `applyTheme` with:

```js
document.documentElement.style.colorScheme = isDark ? "dark" : "light";
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  "content",
  isDark ? "#071423" : "#edf5fb"
);

const status = document.getElementById("theme-status");
if (status) status.textContent = `${isDark ? "Dark" : "Light"} theme active`;
```

Listen for operating-system theme changes only when the visitor has not saved an explicit preference:

```js
media.addEventListener("change", (event) => {
  if (!localStorage.getItem(storageKey)) applyTheme(event.matches);
});
```

- [ ] **Step 4: Preserve URL hashes and active navigation semantics**

Update `setActive` so each primary link receives both visual and semantic state:

```js
const active = link.getAttribute("href") === `#${id}`;
link.classList.toggle("active", active);
if (active) link.setAttribute("aria-current", "page");
else link.removeAttribute("aria-current");
```

After initiating scroll from an in-page navigation link, preserve the address-bar state:

```js
if (window.location.hash !== href) history.pushState(null, "", href);
```

Extract the existing offset scroll into this helper and use it from click, initial-load, and hash-change paths:

```js
const scrollToSection = (target, behavior = "auto") => {
  const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
};

const syncFromHash = () => {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  setActive(id);
  scrollToSection(target);
};

window.addEventListener("hashchange", syncFromHash);
if (window.location.hash) requestAnimationFrame(syncFromHash);
```

Within the click listener, replace the duplicated offset calculation with:

```js
scrollToSection(target, reduceMotion() ? "auto" : "smooth");
if (target.id) setActive(target.id);
if (window.location.hash !== href) history.pushState(null, "", href);
```

- [ ] **Step 5: Run tests and build**

Run: `npm.cmd test`

Expected: PASS with 3 tests and 0 failures.

Run: `npm.cmd run build`

Expected: exit code 0.

- [ ] **Step 6: Commit the interaction change when Git write access is available**

```powershell
git add type.js index.html tests/portfolio.test.mjs
git commit -m "fix: preserve theme and navigation state"
```

### Task 4: Harden responsive layout, touch targets, and visual restraint

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `style.css`

- [ ] **Step 1: Add failing CSS contract tests**

Update the first import to `import { readFile, stat } from "node:fs/promises";`, then append this test:

```js
test("styles protect touch, focus, overflow, and hidden accessible text", async () => {
  const css = await read("style.css");

  assert.match(css, /\.sr-only\s*\{/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /\[aria-current="page"\]/);
  assert.match(css, /text-wrap:\s*balance/);
});
```

- [ ] **Step 2: Run the test and verify the missing contracts fail**

Run: `npm.cmd test`

Expected: FAIL on `.sr-only` or the first missing rule.

- [ ] **Step 3: Add accessibility and containment utilities**

Add:

```css
html,
body {
  max-width: 100%;
  overflow-x: clip;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

h1,
h2,
h3 {
  text-wrap: balance;
}

.navmenu a[aria-current="page"] {
  color: var(--text);
  background: var(--surface);
  box-shadow: inset 0 -2px 0 var(--accent);
}
```

- [ ] **Step 4: Enforce reliable touch targets and wrapping**

Set `min-width: 44px` and `min-height: 44px` on `.theme-toggle-btn` and `.scroll-top`. Set `min-height: 44px` on `.navmenu a`, `.btn`, `.text-link`, and contact links while keeping existing padding and visual sizes. Add `min-width: 0` to flex and grid children that contain text, and use `overflow-wrap: anywhere` only for email addresses or long URLs.

- [ ] **Step 5: Reduce stacked decorative effects without redesigning components**

Change the sticky nav blur from `22px` to `12px`, the hero note blur from `16px` to `10px`, and remove wide resting shadows from bordered cards. Retain a small hover lift with no more than 8px blur where a shadow is still useful. Preserve all existing colors, spacing, typography, and card layout.

- [ ] **Step 6: Run the CSS tests and production build**

Run: `npm.cmd test`

Expected: PASS with 4 tests and 0 failures.

Run: `npm.cmd run build`

Expected: exit code 0.

- [ ] **Step 7: Commit the responsive polish when Git write access is available**

```powershell
git add style.css tests/portfolio.test.mjs
git commit -m "fix: harden responsive accessibility styles"
```

### Task 5: Optimize the largest visible images

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `index.html`
- Create: `Pictures/myshop2-cover.webp`
- Create: `Pictures/homefittools-cover.webp`
- Create: `Pictures/myshop-cover.webp`
- Create: `Pictures/About_cover.webp`
- Create: `Pictures/20191204_001430_IMG_9626.webp`

- [ ] **Step 1: Add failing optimized-asset tests**

Append this test:

```js
test("large visible images have smaller WebP alternatives", async () => {
  const pairs = [
    ["Pictures/myshop2-cover.png", "Pictures/myshop2-cover.webp"],
    ["Pictures/homefittools-cover.png", "Pictures/homefittools-cover.webp"],
    ["Pictures/myshop-cover.png", "Pictures/myshop-cover.webp"],
    ["Pictures/About_cover.JPG", "Pictures/About_cover.webp"],
    ["Pictures/20191204_001430_IMG_9626.JPG", "Pictures/20191204_001430_IMG_9626.webp"]
  ];

  for (const [original, optimized] of pairs) {
    const originalSize = (await stat(new URL(`../${original}`, import.meta.url))).size;
    const optimizedSize = (await stat(new URL(`../${optimized}`, import.meta.url))).size;
    assert.ok(optimizedSize < originalSize, `${optimized} must be smaller than ${original}`);
  }

  const html = await read("index.html");
  for (const [, optimized] of pairs) assert.ok(html.includes(`./${optimized}`));
});
```

- [ ] **Step 2: Run the test and verify missing WebP files fail**

Run: `npm.cmd test`

Expected: FAIL with `ENOENT` for `Pictures/myshop2-cover.webp`.

- [ ] **Step 3: Generate WebP variants with FFmpeg**

Run these commands from the project root:

```powershell
ffmpeg -y -i "Pictures/myshop2-cover.png" -c:v libwebp -quality 82 "Pictures/myshop2-cover.webp"
ffmpeg -y -i "Pictures/homefittools-cover.png" -c:v libwebp -quality 82 "Pictures/homefittools-cover.webp"
ffmpeg -y -i "Pictures/myshop-cover.png" -c:v libwebp -quality 82 "Pictures/myshop-cover.webp"
ffmpeg -y -i "Pictures/About_cover.JPG" -c:v libwebp -quality 82 "Pictures/About_cover.webp"
ffmpeg -y -i "Pictures/20191204_001430_IMG_9626.JPG" -c:v libwebp -quality 84 "Pictures/20191204_001430_IMG_9626.webp"
```

- [ ] **Step 4: Reference optimized images with fallbacks**

Wrap each corresponding `<img>` in a `<picture>` using this structure while preserving the existing alt text, dimensions, loading, and fetch-priority attributes:

```html
<picture>
  <source srcset="./Pictures/myshop2-cover.webp" type="image/webp">
  <img src="./Pictures/myshop2-cover.png" alt="Bamblue Store responsive e-commerce homepage screenshot"
    width="1280" height="720" loading="lazy" decoding="async">
</picture>
```

Use `decoding="async"` for below-the-fold images. Keep the hero portrait without `loading="lazy"`, retain `fetchpriority="high"`, and use its WebP source in the same `<picture>` pattern.

- [ ] **Step 5: Run tests, compare sizes, and build**

Run: `npm.cmd test`

Expected: PASS with 5 tests and 0 failures.

Run:

```powershell
Get-ChildItem Pictures\*.webp | Sort-Object Length -Descending | Select-Object Name, Length
npm.cmd run build
```

Expected: every WebP is smaller than its fallback and Vite exits with code 0.

- [ ] **Step 6: Commit optimized assets when Git write access is available**

```powershell
git add index.html tests/portfolio.test.mjs Pictures/*.webp
git commit -m "perf: optimize portfolio imagery"
```

### Task 6: Perform rendered browser verification

**Files:**
- No committed files; screenshots and temporary diagnostics stay outside the repository.

- [ ] **Step 1: Start the exact Vite target**

Run: `npm.cmd run dev -- --host 127.0.0.1`

Expected: Vite reports a local URL, normally `http://127.0.0.1:5173/`.

- [ ] **Step 2: Verify the primary flow in the in-app browser**

The flow under test is: portfolio loads -> visitor selects Projects -> URL becomes `#projects`, Projects is not hidden under the sticky header, and the Projects navigation link exposes `aria-current="page"`.

Check page title, meaningful DOM content, absence of a Vite error overlay, console warnings and errors, and screenshot evidence.

- [ ] **Step 3: Verify keyboard and theme interactions**

Use the skip link and confirm focus reaches `#main`. Toggle the theme and confirm the body theme, toggle label, status text, `aria-pressed`, browser theme-color metadata, and saved preference all change together. Reload and confirm the explicit preference persists.

- [ ] **Step 4: Verify desktop and mobile rendering**

Check at 1440 by 900 and 390 by 844, plus a narrow 320 pixel width. Confirm no horizontal overflow, clipped navigation, overlapping hero content, hover-only project actions, unreadable text, missing images, or undersized icon controls.

- [ ] **Step 5: Verify reduced motion and direct hashes**

Emulate reduced motion and confirm content is visible without entrance movement. Open `/#contact` directly and confirm the contact section is visible below the sticky header.

- [ ] **Step 6: Run the final verification gate**

Run:

```powershell
npm.cmd test
npm.cmd run build
git diff --check
git status --short
```

Expected: tests and build exit with code 0, `git diff --check` prints no whitespace errors, and `git status --short` lists only the intended implementation files plus documentation.
