import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const extractCssBlock = (css, selector) => {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g);

  for (const rule of rules) {
    if (rule[1].trim() === selector) return rule[2];
  }

  return undefined;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const readWebpDimensionsFromRiff = async (imageUrl) => {
  const assetPath = decodeURIComponent(imageUrl.pathname);
  const data = await readFile(imageUrl);
  const requireBytes = (end, context) => {
    assert.ok(end <= data.length, `${assetPath}: truncated ${context}`);
  };

  requireBytes(12, "RIFF/WebP header");
  assert.equal(
    data.toString("ascii", 0, 4),
    "RIFF",
    `${assetPath}: expected RIFF signature at bytes 0-3`,
  );
  assert.equal(
    data.toString("ascii", 8, 12),
    "WEBP",
    `${assetPath}: expected WEBP signature at bytes 8-11`,
  );

  const declaredLength = data.readUInt32LE(4) + 8;
  assert.equal(
    declaredLength,
    data.length,
    `${assetPath}: malformed RIFF size ${declaredLength}; actual size is ${data.length}`,
  );

  let dimensions;
  let offset = 12;
  while (offset < data.length) {
    requireBytes(offset + 8, `chunk header at byte ${offset}`);
    const chunkType = data.toString("ascii", offset, offset + 4);
    const chunkSize = data.readUInt32LE(offset + 4);
    const payloadStart = offset + 8;
    const payloadEnd = payloadStart + chunkSize;
    const paddedEnd = payloadEnd + (chunkSize % 2);

    requireBytes(payloadEnd, `${chunkType} payload at byte ${payloadStart}`);
    requireBytes(paddedEnd, `${chunkType} padding at byte ${payloadEnd}`);

    if (chunkType === "VP8 ") {
      assert.ok(
        chunkSize >= 10,
        `${assetPath}: truncated VP8 frame header`,
      );
      assert.equal(
        data[payloadStart] & 1,
        0,
        `${assetPath}: malformed VP8 data; expected a key frame`,
      );
      assert.deepEqual(
        [...data.subarray(payloadStart + 3, payloadStart + 6)],
        [0x9d, 0x01, 0x2a],
        `${assetPath}: malformed VP8 frame start code`,
      );
      dimensions ??= {
        width: data.readUInt16LE(payloadStart + 6) & 0x3fff,
        height: data.readUInt16LE(payloadStart + 8) & 0x3fff,
      };
    } else if (chunkType === "VP8L") {
      assert.ok(chunkSize >= 5, `${assetPath}: truncated VP8L header`);
      assert.equal(
        data[payloadStart],
        0x2f,
        `${assetPath}: malformed VP8L signature`,
      );
      const packedDimensions = data.readUInt32LE(payloadStart + 1);
      dimensions ??= {
        width: (packedDimensions & 0x3fff) + 1,
        height: ((packedDimensions >>> 14) & 0x3fff) + 1,
      };
    } else if (chunkType === "VP8X") {
      assert.equal(
        chunkSize,
        10,
        `${assetPath}: malformed VP8X chunk size ${chunkSize}`,
      );
      dimensions ??= {
        width: data.readUIntLE(payloadStart + 4, 3) + 1,
        height: data.readUIntLE(payloadStart + 7, 3) + 1,
      };
    }

    offset = paddedEnd;
  }

  assert.ok(
    dimensions,
    `${assetPath}: unsupported WebP data; expected VP8, VP8L, or VP8X chunk`,
  );
  assert.ok(
    dimensions.width > 0 && dimensions.height > 0,
    `${assetPath}: malformed WebP dimensions ${dimensions.width}x${dimensions.height}`,
  );
  return dimensions;
};

test("large visible images have smaller WebP alternatives", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const images = [
    ["myshop2-cover.png", "myshop2-cover.webp", 1900, 908, true],
    ["homefittools-cover.png", "homefittools-cover.webp", 1900, 907, true],
    ["myshop-cover.png", "myshop-cover.webp", 1897, 907, true],
    ["About_cover.JPG", "About_cover.webp", 1620, 1080, true],
    [
      "20191204_001430_IMG_9626.JPG",
      "20191204_001430_IMG_9626.webp",
      1044,
      1568,
      false,
    ],
  ];

  for (const [original, optimized, width, height, isBelowFold] of images) {
    const [originalFile, optimizedFile] = await Promise.all([
      stat(new URL(`../Pictures/${original}`, import.meta.url)),
      stat(new URL(`../Pictures/${optimized}`, import.meta.url)),
    ]);
    const dimensions = await readWebpDimensionsFromRiff(
      new URL(`../Pictures/${optimized}`, import.meta.url),
    );

    assert.ok(
      optimizedFile.size <= originalFile.size * 0.5,
      `expected ${optimized} to be no more than 50% of ${original}`,
    );
    assert.equal(dimensions.width, width, `unexpected width for ${optimized}`);
    assert.equal(dimensions.height, height, `unexpected height for ${optimized}`);

    const optimizedPath = `./Pictures/${optimized}`;
    const originalPath = `./Pictures/${original}`;
    const sourcePattern = new RegExp(
      `<source\\b(?=[^>]*\\ssrcset="${escapeRegex(optimizedPath)}"(?=\\s|>))[^>]*>`,
    );
    const fallbackPattern = new RegExp(
      `<img\\b(?=[^>]*\\ssrc="${escapeRegex(originalPath)}"(?=\\s|>))[^>]*>`,
    );
    const pictures = [...html.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/g)]
      .map((match) => match[0])
      .filter(
        (picture) =>
          sourcePattern.test(picture) && fallbackPattern.test(picture),
      );
    assert.equal(
      pictures.length,
      1,
      `expected one picture pairing ${optimizedPath} with ${originalPath}`,
    );

    const picture = pictures[0];
    const source = picture.match(sourcePattern)?.[0];
    assert.ok(source, `expected WebP source for ${optimized}`);
    assert.match(source, /\stype="image\/webp"(?=\s|>)/);
    assert.match(
      source,
      new RegExp(`\\ssrcset="${escapeRegex(optimizedPath)}"(?=\\s|>)`),
    );

    const img = picture.match(fallbackPattern)?.[0];
    assert.ok(img, `expected fallback img for ${original}`);
    assert.ok(
      picture.indexOf(source) < picture.indexOf(img),
      `expected ${optimized} source before ${original} fallback`,
    );
    assert.match(img, new RegExp(`\\bwidth="${width}"`));
    assert.match(img, new RegExp(`\\bheight="${height}"`));

    if (isBelowFold) {
      assert.match(img, /\bloading="lazy"/);
      assert.match(img, /\bdecoding="async"/);
    } else {
      assert.match(img, /\bfetchpriority="high"/);
      assert.doesNotMatch(img, /\bloading="lazy"/);
    }
  }
});

test("project provides a complete Vite workflow", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(packageJson.scripts.preview, "vite preview");
  assert.equal(packageJson.scripts.test, "node --test tests/*.test.mjs");
  assert.ok(packageJson.devDependencies.vite);

  const gitignoreLines = (
    await readFile(new URL("../.gitignore", import.meta.url), "utf8")
  ).split(/\r?\n/);

  assert.ok(gitignoreLines.includes("node_modules/"));
  assert.ok(gitignoreLines.includes("dist/"));
  assert.ok(gitignoreLines.includes(".env.*"));
});

test("document exposes accessible navigation and complete known metadata", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<meta name="author" content="Chanatip Tonngern">/);
  assert.match(html, /<meta property="og:locale" content="en_US">/);
  assert.match(
    html,
    /<meta property="og:site_name" content="Chanatip Tonngern Portfolio">/,
  );
  assert.match(
    html,
    /<meta property="og:image:alt" content="Chanatip Tonngern front-end developer portfolio preview">/,
  );
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(
    html,
    /<meta name="twitter:title" content="Chanatip Tonngern \| Front-End Developer Portfolio">/,
  );
  assert.match(
    html,
    /<meta name="twitter:description"\s+content="Product-style front-end developer portfolio featuring selected projects, tech stack, journey, and contact information\.">/,
  );
  assert.match(
    html,
    /<meta name="twitter:image" content="\.\/Pictures\/portfolio_cover\.jpg">/,
  );

  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(jsonLdMatch, "expected an application/ld+json script");
  const person = JSON.parse(jsonLdMatch[1]);
  assert.equal(person["@type"], "Person");
  assert.equal(person.name, "Chanatip Tonngern");
  assert.equal(person.jobTitle, "Front-End Developer");
  assert.equal(person.email, "mailto:chanatiptonngern@gmail.com");
  assert.deepEqual(person.sameAs, [
    "https://github.com/oOEARNZOo",
    "https://www.linkedin.com/in/chanatip-tonngern-698941364/",
  ]);

  assert.match(
    html,
    /<span\b(?=[^>]*\bid="theme-status")(?=[^>]*\baria-live="polite")[^>]*>/,
  );
  assert.match(
    html,
    /<button\b(?=[^>]*\bid="toggle-dark")(?=[^>]*\baria-describedby="theme-status")[^>]*>/,
  );
  assert.match(html, /aria-current="page"/);

  const mainTag = html.match(/<main\b[^>]*>/)?.[0];
  assert.ok(mainTag, "expected a main element");
  assert.match(mainTag, /\bid="main"/);
  assert.match(mainTag, /\btabindex="-1"/);
});

test("document identifies one featured project", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const featuredProjects = html.match(/<article\b[^>]*\bfeatured-project\b[^>]*>/g) ?? [];

  assert.equal(featuredProjects.length, 1);
  assert.match(
    featuredProjects[0],
    /aria-labelledby="featured-project-title"/,
  );
  assert.match(
    html,
    /<h3\s+id="featured-project-title">\s*Bamblue Store\s*<\/h3>/,
  );
});

test("script keeps live accessibility states synchronized", async () => {
  const script = await readFile(new URL("../type.js", import.meta.url), "utf8");

  assert.match(script, /getElementById\("theme-status"\)/);
  assert.match(
    script,
    /\.textContent\s*=\s*isDark\s*\?\s*"Dark theme active"\s*:\s*"Light theme active"/,
  );
  assert.match(
    script,
    /const active\s*=\s*link\.getAttribute\("href"\)\s*===\s*`#\$\{id\}`/,
  );
  assert.match(script, /classList\.toggle\("active", active\)/);
  assert.match(script, /setAttribute\("aria-current", "page"\)/);
  assert.match(script, /removeAttribute\("aria-current"\)/);
  assert.match(script, /document\.documentElement\.classList\.add\("js-ready"\)/);
});

test("styles protect touch, focus, overflow, and hidden accessible text", async () => {
  const [css, html] = await Promise.all([
    readFile(new URL("../style.css", import.meta.url), "utf8"),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
  ]);

  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /text-wrap:\s*balance/);
  assert.match(css, /\.js-ready\s+\.scroll-reveal/);

  const currentPageBlock = extractCssBlock(
    css,
    '.navmenu a[aria-current="page"]',
  );
  assert.ok(currentPageBlock, "expected a persistent current-page block");
  assert.match(
    currentPageBlock,
    /box-shadow:\s*inset 0 -2px 0 var\(--accent\)/,
  );

  for (const [selector, requiresWidth] of [
    [".brand", true],
    [".navmenu a", false],
    [".theme-toggle-btn", true],
    [".btn", false],
    [".text-link", false],
    [".contact-links a", false],
    [".scroll-top", true],
  ]) {
    const block = extractCssBlock(css, selector);
    assert.ok(block, `expected a ${selector} block`);

    const minHeight = block.match(/min-height:\s*(\d+)px/)?.[1];
    assert.ok(minHeight, `expected ${selector} to declare min-height`);
    assert.ok(
      Number(minHeight) >= 44,
      `expected ${selector} min-height to be at least 44px`,
    );

    if (requiresWidth) {
      assert.match(block, /min-width:\s*44px/);
    } else {
      assert.doesNotMatch(block, /min-width:\s*44px/);
    }
  }

  for (const selector of [
    ".project-card",
    ".skill-card",
    ".about-photo",
    ".contact-panel",
  ]) {
    const block = extractCssBlock(css, selector);
    assert.ok(block, `expected a ${selector} block`);
    assert.match(block, /box-shadow:\s*none/);
  }

  const srOnlyBlock = extractCssBlock(css, ".sr-only");
  assert.ok(srOnlyBlock, "expected an .sr-only block");
  for (const declaration of [
    /position:\s*absolute/,
    /width:\s*1px/,
    /height:\s*1px/,
    /padding:\s*0/,
    /margin:\s*-1px/,
    /overflow:\s*hidden/,
    /clip:\s*rect\(0,\s*0,\s*0,\s*0\)/,
    /white-space:\s*nowrap/,
    /border:\s*0/,
  ]) {
    assert.match(srOnlyBlock, declaration);
  }

  assert.match(
    extractCssBlock(css, ".pill-nav"),
    /backdrop-filter:\s*blur\(12px\)/,
  );
  assert.match(
    extractCssBlock(css, ".hero-note"),
    /backdrop-filter:\s*blur\(10px\)/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*721px\)\s*and\s*\(max-width:\s*980px\)\s*\{[\s\S]*?\.navmenu a:focus-visible\s*\{[^}]*outline-offset:\s*-3px;/,
  );

  for (const [selector, block] of [
    [".project-card:hover", extractCssBlock(css, ".project-card:hover")],
    [".skill-card:hover", extractCssBlock(css, ".skill-card:hover")],
  ]) {
    assert.ok(block, `expected a ${selector} block`);
    assert.doesNotMatch(block, /var\(--shadow-md\)/);

    const hoverShadow = block.match(
      /box-shadow:\s*0\s+-?\d+px\s+(\d+)px\s+rgba\([^)]+\)/,
    );
    assert.ok(hoverShadow, `expected an explicit ${selector} hover shadow`);
    assert.ok(
      Number(hoverShadow[1]) <= 8,
      `expected ${selector} hover shadow blur to be no greater than 8px`,
    );
  }

  for (const [selector, block] of [
    [
      "body.dark-mode .project-card:hover",
      extractCssBlock(css, "body.dark-mode .project-card:hover"),
    ],
    [
      "body.dark-mode .skill-card:hover",
      extractCssBlock(css, "body.dark-mode .skill-card:hover"),
    ],
  ]) {
    assert.ok(block, `expected a ${selector} block`);

    const darkHoverShadow = block.match(
      /box-shadow:\s*0\s+-?\d+px\s+(\d+)px\s+rgba\(0,\s*0,\s*0,\s*0\.34\)/,
    );
    assert.ok(
      darkHoverShadow,
      `expected ${selector} to preserve the dark shadow color`,
    );
    assert.ok(
      Number(darkHoverShadow[1]) <= 8,
      `expected ${selector} shadow blur to be no greater than 8px`,
    );
  }

  const themeStatus = html.match(/<span\b(?=[^>]*\bid="theme-status")[^>]*>/)?.[0];
  assert.ok(themeStatus, "expected the theme status element");
  assert.match(themeStatus, /\bclass="sr-only"/);
  assert.doesNotMatch(themeStatus, /\bstyle=/);
});

test("enhancement script synchronizes system theme, URL hash, and browser metadata", async () => {
  const [script, html] = await Promise.all([
    readFile(new URL("../type.js", import.meta.url), "utf8"),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
  ]);

  assert.match(script, /window\.matchMedia\("\(prefers-color-scheme: dark\)"\)/);
  assert.match(
    script,
    /const readStoredTheme\s*=\s*\(\)\s*=>[\s\S]*?localStorage\.getItem\(storageKey\)[\s\S]*?theme === "dark" \|\| theme === "light"[\s\S]*?\? theme : null/,
  );
  assert.match(script, /const savedTheme\s*=\s*readStoredTheme\(\)/);
  assert.match(script, /document\.documentElement\.style\.colorScheme\s*=/);
  assert.match(script, /querySelector\(['"]meta\[name=["']theme-color["']\]["']\)/);
  assert.match(script, /setAttribute\("content",\s*isDark\s*\?\s*"#071423"\s*:\s*"#edf5fb"\)/);
  assert.match(
    script,
    /media\.addEventListener\("change",[\s\S]*?readStoredTheme\(\) === null[\s\S]*?applyTheme/,
  );
  assert.match(script, /history\.pushState\(null,\s*"",\s*href\)/);
  assert.match(script, /window\.addEventListener\("hashchange",\s*syncFromHash\)/);
  assert.match(
    script,
    /const id\s*=\s*window\.location\.hash\.slice\(1\) \|\| "home";[\s\S]*?const target\s*=\s*document\.getElementById\(id\);[\s\S]*?if \(!target\) return;/,
  );
  assert.match(script, /requestAnimationFrame\(syncFromHash\)/);
  assert.match(
    html,
    /<script\b(?=[^>]*\btype="module")(?=[^>]*\bsrc="type\.js")[^>]*><\/script>/,
  );
});
