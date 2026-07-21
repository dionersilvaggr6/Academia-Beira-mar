import { expect, type Page, test } from "@playwright/test";

/**
 * Responsive audit — measures real, rendered layout on the public pages at
 * three viewports. This is a read-only measurement (no writes, no DB access)
 * so it is safe to keep as a standing regression check via `npm run test:e2e`.
 *
 * It is NOT wired into `npm test` (vitest) or any build step — see
 * vitest.config.ts (`include: ["tests/**"]`) and package.json, so it only
 * runs when explicitly invoked with Playwright.
 */

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

const ROUTES = ["/", "/login"] as const;

type OverflowOffender = {
  tag: string;
  id: string | null;
  className: string | null;
  right: number;
  width: number;
  text: string;
};

type SmallTextEntry = {
  tag: string;
  className: string | null;
  fontSize: number;
  text: string;
};

type TapTargetEntry = {
  tag: string;
  className: string | null;
  width: number;
  height: number;
  label: string;
};

type Measurement = {
  innerWidth: number;
  scrollWidth: number;
  hasOverflow: boolean;
  overflowOffenders: OverflowOffender[];
  smallText: SmallTextEntry[];
  tapTargets: TapTargetEntry[];
};

function measureInPage(): Measurement {
  const innerWidth = window.innerWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const hasOverflow = scrollWidth > innerWidth;

  // Horizontal overflow: walk every element and keep only the outermost
  // offenders (skip an element if its own parent already overflows), so the
  // report points at root causes instead of every descendant.
  const overflowSet = new Set<Element>();
  if (hasOverflow) {
    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.right > innerWidth + 1) {
        overflowSet.add(el);
      }
    }
  }
  const overflowOffenders: OverflowOffender[] = Array.from(overflowSet)
    .filter((el) => !el.parentElement || !overflowSet.has(el.parentElement))
    .slice(0, 25)
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className:
          typeof el.className === "string" ? el.className.slice(0, 160) : null,
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
      };
    });

  // Body-copy text under 14px (excludes anything hidden or zero-area).
  const smallText: SmallTextEntry[] = [];
  for (const el of document.querySelectorAll("body *")) {
    const hasOwnText = Array.from(el.childNodes).some(
      (n) =>
        n.nodeType === Node.TEXT_NODE &&
        (n.textContent ?? "").trim().length > 0,
    );
    if (!hasOwnText) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const fontSize = Number.parseFloat(getComputedStyle(el).fontSize);
    if (fontSize < 14) {
      smallText.push({
        tag: el.tagName.toLowerCase(),
        className:
          typeof el.className === "string" ? el.className.slice(0, 160) : null,
        fontSize,
        text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
      });
    }
  }

  // Interactive elements smaller than a 40x40 tap target (excludes hidden
  // nav items collapsed to 0x0 and hidden inputs).
  const tapTargets: TapTargetEntry[] = [];
  for (const el of document.querySelectorAll("a, button, input")) {
    if (el instanceof HTMLInputElement && el.type === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.width < 40 || rect.height < 40) {
      tapTargets.push({
        tag: el.tagName.toLowerCase(),
        className:
          typeof el.className === "string" ? el.className.slice(0, 160) : null,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        label: (el.textContent || el.getAttribute("aria-label") || "")
          .trim()
          .slice(0, 40),
      });
    }
  }

  return {
    innerWidth,
    scrollWidth,
    hasOverflow,
    overflowOffenders,
    smallText,
    tapTargets,
  };
}

async function measure(
  page: Page,
  route: string,
  viewportName: string,
): Promise<Measurement> {
  await page.goto(route, { waitUntil: "load" });
  // Dev server + client hydration + next/font: give the page a beat to settle
  // instead of `networkidle`, which never resolves against `next dev`'s HMR
  // websocket.
  await page.locator("footer").first().waitFor({ state: "attached" });
  await page.waitForTimeout(250);

  const result = await page.evaluate(measureInPage);

  const offenderList = result.overflowOffenders
    .map(
      (o) =>
        `    - <${o.tag}${o.id ? `#${o.id}` : ""}> right=${o.right} width=${o.width} class="${o.className ?? ""}" text="${o.text}"`,
    )
    .join("\n");
  const smallTextList = result.smallText
    .map(
      (s) =>
        `    - <${s.tag}> ${s.fontSize}px class="${s.className ?? ""}" text="${s.text}"`,
    )
    .join("\n");
  const tapTargetList = result.tapTargets
    .map(
      (t) =>
        `    - <${t.tag}> ${t.width}x${t.height} class="${t.className ?? ""}" label="${t.label}"`,
    )
    .join("\n");

  console.log(
    `\n[responsive] ${route} @ ${viewportName} (${VIEWPORTS.find((v) => v.name === viewportName)?.width}px)\n` +
      `  innerWidth=${result.innerWidth} scrollWidth=${result.scrollWidth} overflow=${result.hasOverflow}\n` +
      `  smallText: ${result.smallText.length}${smallTextList ? `\n${smallTextList}` : ""}\n` +
      `  tapTargets<40px: ${result.tapTargets.length}${tapTargetList ? `\n${tapTargetList}` : ""}` +
      (result.hasOverflow ? `\n  overflow offenders:\n${offenderList}` : ""),
  );

  return result;
}

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`no horizontal overflow: ${route} @ ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      const result = await measure(page, route, viewport.name);

      expect
        .soft(
          result.hasOverflow,
          `${route} @ ${viewport.name}: scrollWidth ${result.scrollWidth} > innerWidth ${result.innerWidth}`,
        )
        .toBe(false);
    });
  }
}
