import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const appDir = path.join(root, "src", "app");
const publicDir = path.join(root, "public");

const colors = {
  ink: "#09090b",
  panel: "#111318",
  panel2: "#191d24",
  line: "#2d3440",
  paper: "#f5f0e8",
  paperDim: "#d6d0c4",
  blue: "#1185fe",
  cyan: "#43c6ff",
  green: "#29d391",
  amber: "#f4b860",
  white: "#f8fafc",
  muted: "#a9b2c3",
};

function svg(strings, ...values) {
  return String.raw({ raw: strings }, ...values);
}

function appMark(size = 512) {
  const scale = size / 512;
  const s = (value) => Math.round(value * scale * 100) / 100;

  return svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="78" y1="44" x2="434" y2="468" gradientUnits="userSpaceOnUse">
      <stop stop-color="#172033"/>
      <stop offset="0.48" stop-color="#0d1118"/>
      <stop offset="1" stop-color="#07131f"/>
    </linearGradient>
    <linearGradient id="db" x1="134" y1="114" x2="370" y2="350" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7dd3fc"/>
      <stop offset="0.42" stop-color="${colors.blue}"/>
      <stop offset="1" stop-color="#2457d6"/>
    </linearGradient>
    <linearGradient id="lens" x1="162" y1="246" x2="354" y2="404" gradientUnits="userSpaceOnUse">
      <stop stop-color="#eff6ff"/>
      <stop offset="0.35" stop-color="#80d9ff"/>
      <stop offset="1" stop-color="#1166cc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#020617" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect x="${s(24)}" y="${s(24)}" width="${s(464)}" height="${s(464)}" rx="${s(104)}" fill="url(#bg)"/>
  <path d="M118 374c72 43 204 48 278 2" fill="none" stroke="#1f2937" stroke-width="18" stroke-linecap="round" opacity=".65"/>
  <g filter="url(#shadow)">
    <path d="M144 150c0-34 50-62 112-62s112 28 112 62v142c0 34-50 62-112 62s-112-28-112-62V150Z" fill="url(#db)"/>
    <ellipse cx="256" cy="150" rx="112" ry="62" fill="#90ddff"/>
    <ellipse cx="256" cy="150" rx="82" ry="38" fill="#2479e8"/>
    <path d="M144 210c0 34 50 62 112 62s112-28 112-62M144 264c0 34 50 62 112 62s112-28 112-62" fill="none" stroke="#bdeaff" stroke-width="18" stroke-linecap="round" opacity=".88"/>
    <path d="M170 190v96c0 16 22 33 54 42" fill="none" stroke="#dff7ff" stroke-width="14" stroke-linecap="round" opacity=".58"/>
  </g>
  <g filter="url(#shadow)">
    <path d="M214 286h84c17 0 31 14 31 31v20h-146v-20c0-17 14-31 31-31Z" fill="#121722" stroke="#d9e8ff" stroke-width="18" stroke-linejoin="round"/>
    <circle cx="188" cy="352" r="64" fill="#121722" stroke="#eef7ff" stroke-width="20"/>
    <circle cx="324" cy="352" r="64" fill="#121722" stroke="#eef7ff" stroke-width="20"/>
    <circle cx="188" cy="352" r="38" fill="url(#lens)"/>
    <circle cx="324" cy="352" r="38" fill="url(#lens)"/>
    <path d="M174 331c10-12 24-18 42-18M310 331c10-12 24-18 42-18" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity=".7"/>
    <path d="M236 346h40" stroke="#eef7ff" stroke-width="20" stroke-linecap="round"/>
    <path d="M116 342l28-28M396 342l-28-28" stroke="#eef7ff" stroke-width="18" stroke-linecap="round"/>
  </g>
</svg>`;
}

function ogImage() {
  const iconDataUri = `data:image/svg+xml;base64,${Buffer.from(appMark()).toString("base64")}`;

  return svg`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="backdrop" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0a0c10"/>
      <stop offset="0.55" stop-color="#10151d"/>
      <stop offset="1" stop-color="#071522"/>
    </linearGradient>
    <linearGradient id="cabinet" x1="127" y1="110" x2="489" y2="562" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3a4352"/>
      <stop offset="1" stop-color="#171c25"/>
    </linearGradient>
    <linearGradient id="drawer" x1="167" y1="139" x2="494" y2="418" gradientUnits="userSpaceOnUse">
      <stop stop-color="#eef2f7"/>
      <stop offset="1" stop-color="#c4cad3"/>
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="150%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#020617" flood-opacity="0.42"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="150%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#020617" flood-opacity="0.28"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#backdrop)"/>
  <path d="M0 508C152 442 269 465 393 501c126 37 246 62 421 13 162-46 256-22 386 38v78H0Z" fill="#0d2430" opacity=".72"/>
  <path d="M67 84h1066M67 544h1066" stroke="#253041" stroke-width="1"/>

  <g opacity=".88">
    <path d="M812 107c24 0 37 13 53 31 17 19 37 31 63 31s46-12 63-31c16-18 29-31 53-31" fill="none" stroke="${colors.blue}" stroke-width="9" stroke-linecap="round"/>
    <path d="M812 153c24 0 37 13 53 31 17 19 37 31 63 31s46-12 63-31c16-18 29-31 53-31" fill="none" stroke="${colors.cyan}" stroke-width="9" stroke-linecap="round" opacity=".72"/>
    <circle cx="812" cy="107" r="10" fill="${colors.blue}"/>
    <circle cx="928" cy="169" r="10" fill="${colors.blue}"/>
    <circle cx="1044" cy="107" r="10" fill="${colors.blue}"/>
    <circle cx="812" cy="153" r="8" fill="${colors.cyan}"/>
    <circle cx="1044" cy="153" r="8" fill="${colors.cyan}"/>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="102" y="112" width="446" height="400" rx="30" fill="url(#cabinet)" stroke="#445065" stroke-width="2"/>
    <rect x="138" y="147" width="374" height="92" rx="16" fill="url(#drawer)"/>
    <rect x="138" y="268" width="374" height="92" rx="16" fill="url(#drawer)"/>
    <rect x="138" y="389" width="374" height="92" rx="16" fill="url(#drawer)"/>
    <rect x="184" y="180" width="112" height="16" rx="8" fill="#767f8e"/>
    <rect x="184" y="301" width="142" height="16" rx="8" fill="#767f8e"/>
    <rect x="184" y="422" width="128" height="16" rx="8" fill="#767f8e"/>
    <rect x="376" y="174" width="70" height="28" rx="14" fill="${colors.blue}"/>
    <rect x="376" y="295" width="70" height="28" rx="14" fill="${colors.green}"/>
    <rect x="376" y="416" width="70" height="28" rx="14" fill="${colors.amber}"/>
    <path d="M154 254h342M154 375h342" stroke="#7a8392" stroke-width="2" opacity=".5"/>
  </g>

  <g filter="url(#soft)">
    <rect x="441" y="78" width="172" height="172" rx="42" fill="#0b111a" stroke="#263245" stroke-width="2"/>
    <image href="${iconDataUri}" x="449" y="86" width="156" height="156"/>
  </g>

  <g font-family="ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace">
    <text x="610" y="246" fill="${colors.white}" font-size="66" font-weight="800" letter-spacing="0">PDS Viewer</text>
    <text x="616" y="302" fill="${colors.cyan}" font-size="26" font-weight="700" letter-spacing="0">AT Protocol Repo Browser</text>
    <text x="616" y="362" fill="${colors.muted}" font-size="22" letter-spacing="0">Browse Signed-In PDS Records</text>
    <text x="616" y="396" fill="${colors.muted}" font-size="22" letter-spacing="0">As a Clean NSID Folder Tree.</text>
    <text x="616" y="430" fill="${colors.muted}" font-size="22" letter-spacing="0">OAuth-Powered. Read-Only.</text>
    <text x="616" y="464" fill="${colors.muted}" font-size="22" letter-spacing="0">Client-Side.</text>
    <g transform="translate(616 498)">
      <rect width="132" height="38" rx="10" fill="#162032" stroke="#2b3b54"/>
      <text x="16" y="25" fill="${colors.paper}" font-size="16" font-weight="700">Records</text>
      <rect x="150" width="112" height="38" rx="10" fill="#162032" stroke="#2b3b54"/>
      <text x="166" y="25" fill="${colors.paper}" font-size="16" font-weight="700">Blobs</text>
      <rect x="280" width="136" height="38" rx="10" fill="#162032" stroke="#2b3b54"/>
      <text x="296" y="25" fill="${colors.paper}" font-size="16" font-weight="700">Repo Map</text>
    </g>
  </g>
</svg>`;
}

function makeIco(entries) {
  const headerSize = 6;
  const directorySize = entries.length * 16;
  let offset = headerSize + directorySize;
  const buffers = [Buffer.alloc(headerSize), Buffer.alloc(directorySize)];

  buffers[0].writeUInt16LE(0, 0);
  buffers[0].writeUInt16LE(1, 2);
  buffers[0].writeUInt16LE(entries.length, 4);

  entries.forEach((entry, index) => {
    const dir = buffers[1];
    const base = index * 16;
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, base);
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, base + 1);
    dir.writeUInt8(0, base + 2);
    dir.writeUInt8(0, base + 3);
    dir.writeUInt16LE(1, base + 4);
    dir.writeUInt16LE(32, base + 6);
    dir.writeUInt32LE(entry.buffer.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += entry.buffer.length;
    buffers.push(entry.buffer);
  });

  return Buffer.concat(buffers);
}

async function renderPng(svgSource, size) {
  return sharp(Buffer.from(svgSource)).resize(size, size).png().toBuffer();
}

async function main() {
  await mkdir(appDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  const markSvg = appMark();
  const ogSvg = ogImage();
  const faviconEntries = await Promise.all(
    [16, 32, 48, 64].map(async (size) => ({
      size,
      buffer: await renderPng(markSvg, size),
    })),
  );

  await writeFile(path.join(publicDir, "pds-viewer-mark.svg"), markSvg);
  await writeFile(path.join(appDir, "favicon.ico"), makeIco(faviconEntries));
  await writeFile(path.join(appDir, "icon.png"), await renderPng(markSvg, 512));
  await writeFile(path.join(appDir, "apple-icon.png"), await renderPng(markSvg, 180));
  await writeFile(
    path.join(appDir, "opengraph-image.png"),
    await sharp(Buffer.from(ogSvg)).png().toBuffer(),
  );
  await writeFile(
    path.join(appDir, "opengraph-image.alt.txt"),
    "PDS Viewer logo beside a filing cabinet and AT Protocol network lines.",
  );
  await writeFile(
    path.join(appDir, "twitter-image.png"),
    await sharp(Buffer.from(ogSvg)).png().toBuffer(),
  );
  await writeFile(
    path.join(appDir, "twitter-image.alt.txt"),
    "PDS Viewer logo beside a filing cabinet and AT Protocol network lines.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
