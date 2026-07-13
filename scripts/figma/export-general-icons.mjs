#!/usr/bin/env node
/**
 * Exports icon sets from Figma as SVGs.
 *
 * Usage:
 *   FIGMA_TOKEN=xxxx node scripts/figma/export-general-icons.mjs
 *   FIGMA_TOKEN=xxxx node scripts/figma/export-general-icons.mjs arrows
 *   FIGMA_TOKEN=xxxx node scripts/figma/export-general-icons.mjs general
 *
 * Notes:
 * - Writes into `src/runtime/assets/icons/<set>/`
 * - Preserves icon names from the right-side labels (Figma component names)
 * - Normalizes `stroke="black"` → `stroke="currentColor"` (and same for `fill="black"`)
 */

import fs from "node:fs/promises";
import path from "node:path";

const FILE_KEY = "M5Pmju2u0V1D44toH41Eoi";

const SET_CONFIG = {
  general: {
    iconDir: path.resolve("src/runtime/assets/icons/general"),
    nodeMapPath: path.resolve("scripts/figma/general-icons.node-map.json"),
  },
  arrows: {
    iconDir: path.resolve("src/runtime/assets/icons/arrows"),
    nodeMapPath: path.resolve("scripts/figma/arrows-icons.node-map.json"),
  },
};

const selectedSet = process.argv[2] || "general";
if (!Object.hasOwn(SET_CONFIG, selectedSet)) {
  console.error(
    `Unknown icon set "${selectedSet}". Valid sets: ${Object.keys(SET_CONFIG).join(", ")}`,
  );
  process.exit(1);
}

const { iconDir: ICON_DIR, nodeMapPath: NODE_MAP_PATH } = SET_CONFIG[selectedSet];

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error("Missing FIGMA_TOKEN env var.");
  process.exit(1);
}

/** @type {Record<string, string>} */
const nodeMap = JSON.parse(await fs.readFile(NODE_MAP_PATH, "utf8"));
const ids = Object.keys(nodeMap);

await fs.mkdir(ICON_DIR, { recursive: true });

function normalizeSvg(svg) {
  return svg
    .replaceAll('stroke="black"', 'stroke="currentColor"')
    .replaceAll("stroke='black'", "stroke='currentColor'")
    .replaceAll('fill="black"', 'fill="currentColor"')
    .replaceAll("fill='black'", "fill='currentColor'");
}

async function figmaImages(idsChunk) {
  const url = new URL(`https://api.figma.com/v1/images/${FILE_KEY}`);
  url.searchParams.set("ids", idsChunk.join(","));
  url.searchParams.set("format", "svg");

  const res = await fetch(url, {
    headers: {
      "X-Figma-Token": token,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Figma images API failed (${res.status}): ${text}`);
  }
  /** @type {{ err?: string | null, images?: Record<string, string | null> }} */
  const json = await res.json();
  if (json.err) throw new Error(`Figma images API error: ${json.err}`);
  if (!json.images) throw new Error("Figma images API: missing images field");
  return json.images;
}

async function downloadSvg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SVG download failed (${res.status}) ${url}`);
  return await res.text();
}

const chunkSize = 50; // Figma API supports multiple ids per request; keep conservative
let written = 0;
const missing = [];

for (let i = 0; i < ids.length; i += chunkSize) {
  const chunk = ids.slice(i, i + chunkSize);
  const images = await figmaImages(chunk);

  for (const id of chunk) {
    const name = nodeMap[id];
    const assetUrl = images[id];
    if (!assetUrl) {
      missing.push({ id, name });
      continue;
    }

    const rawSvg = await downloadSvg(assetUrl);
    const svg = normalizeSvg(rawSvg);
    const outPath = path.join(ICON_DIR, `${name}.svg`);
    await fs.writeFile(outPath, svg, "utf8");
    written += 1;
  }
}

if (missing.length) {
  console.warn(`Missing ${missing.length} icons from Figma export:`);
  for (const m of missing) console.warn(`- ${m.name} (${m.id})`);
}

console.log(`Wrote ${written} "${selectedSet}" SVG icons to ${ICON_DIR}`);

