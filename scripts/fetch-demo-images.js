/**
 * Downloads demonstration images from Wikimedia Commons (freely licensed: CC0 / CC BY / CC BY-SA)
 * into src/images and writes src/images/credits.json with attribution for every file.
 * Images are committed to the repository, so the build itself never needs network access.
 *
 * Usage: npm run fetch-demo-images [-- --force]
 */
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'images');
const UA = 'mynewspaper-demo-fetch/1.0 (static site generator demo; local development)';

/** [local path, Commons file title, author, licence, licence URL] */
const manifest = [
  ['articles/coastal-summit.jpg', 'Waves breaking over the sea wall at Dawlish (2025e).JPG', 'Geof Sheppard', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['articles/ferry-harbour.jpg', 'Aarhus to Samsø passenger ferry Lilleøre in Aarhus harbour Denmark 01.jpg', 'Ciara Ní Riain', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['articles/parliament-chamber.jpg', 'Inside the Dáil - The Irish Parliament Chamber.jpg', 'David Kernan', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['articles/housing-blocks.jpg', 'Modern apartment buildings, Gants Hill, London.jpg', 'The wub', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['articles/offshore-wind.jpg', 'Middelgrunden wind farm 2009-07-01 edit filtered.jpg', 'Kim Hansen', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
  ['articles/central-bank.jpg', 'Rostov-on-Don, State Bank, Central Bank, Russia.jpg', 'Vyacheslav Argenberg', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['articles/server-racks.jpg', 'Datacenter Server Racks (22370909788).jpg', 'Carl Lender', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
  ['articles/phone-map.jpg', 'Smartphone with navigation map app.jpg', 'Santeri Viinamäki', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['articles/football-stadium.jpg', 'Mecz piłkarski Wisła Kraków - Zagłębie Sosnwoiec, 28 października 2022, Pożegnanie Stadionu Ludowego, KP.jpg', 'Krzysztof Popławski', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['articles/marathon-runners.jpg', 'View of London Marathon runners on Lower Thames Street - geograph.org.uk - 7468857.jpg', 'Robert Lamb', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['articles/underwater-reef.jpg', 'Great Barrier Reef 011 (5441015088).jpg', 'Steve Evans', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
  ['articles/city-trees.jpg', 'Klagenfurt Viktring Stiftspark Allee 01082022 2771.jpg', 'Johann Jaritz', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['articles/office-desk.jpg', 'Desktop after work (Unsplash).jpg', 'Luca Bravo', 'CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['articles/island-coast.jpg', 'Tresco - aerial photo6.jpg', 'Tom Corser', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
  ['brand/default-social.jpg', 'Desktop after work (Unsplash).jpg', 'Luca Bravo', 'CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
];

const force = process.argv.includes('--force');
const creditsFile = path.join(outDir, 'credits.json');
let credits = {};
try {
  credits = JSON.parse(await readFile(creditsFile, 'utf8'));
} catch {
  /* first run */
}

for (const [rel, title, author, licence, licenceUrl] of manifest) {
  const dest = path.join(outDir, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  const sourcePage = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replace(/ /g, '_'))}`;
  credits[rel] = { title, author, licence, licenceUrl, source: sourcePage };

  if (!force) {
    try {
      await access(dest);
      console.log(`skip   ${rel} (exists)`);
      continue;
    } catch {
      /* not present, download */
    }
  }
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=1200`;
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } });
  if (!res.ok) {
    console.error(`FAILED ${rel}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`saved  ${rel}  ← ${title} (${licence}, ${author})`);
  await new Promise((r) => setTimeout(r, 1500));
}

await writeFile(creditsFile, JSON.stringify(credits, null, 2) + '\n');
console.log(`✔ Wrote ${path.relative(root, creditsFile)}`);
