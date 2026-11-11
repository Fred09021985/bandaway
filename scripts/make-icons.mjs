// Génère les visuels source (icône + splash) pour @capacitor/assets — thème PSG
import sharp from 'sharp';
const defs = `<defs>
<linearGradient id="kit" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#3a1479"/><stop offset=".35" stop-color="#3a1479"/>
  <stop offset=".35" stop-color="#ffffff"/><stop offset=".38" stop-color="#ffffff"/>
  <stop offset=".38" stop-color="#ff2e97"/><stop offset=".62" stop-color="#ff2e97"/>
  <stop offset=".62" stop-color="#ffffff"/><stop offset=".65" stop-color="#ffffff"/>
  <stop offset=".65" stop-color="#3a1479"/><stop offset="1" stop-color="#3a1479"/>
</linearGradient>
<radialGradient id="h" cx=".3" cy=".2" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
const mark = (s, ox, oy) => `<g transform="translate(${ox},${oy}) scale(${s})">
<path d="M3 40 17 17l8 11 6-8 14 20z" fill="#fff"/><path d="m17 17 4 6.5-4 3-3.5-3z" fill="#3a1479" opacity=".55"/><circle cx="35" cy="11" r="5.5" fill="#fff"/></g>`;
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`);
const bg = (w) => `<rect width="${w}" height="${w}" fill="url(#kit)"/><rect width="${w}" height="${w}" fill="url(#h)"/>`;

await sharp(svg(1024, 1024, `${bg(1024)}${mark(13, 200, 200)}`)).png().toFile('assets/icon-only.png');
await sharp(svg(1024, 1024, `${mark(8.5, 308, 300)}`)).png().toFile('assets/icon-foreground.png');
await sharp(svg(1024, 1024, bg(1024))).png().toFile('assets/icon-background.png');
const splash = `<rect width="2732" height="2732" fill="#0a0614"/>
<circle cx="900" cy="900" r="900" fill="#6224d6" opacity=".22"/><circle cx="1900" cy="1900" r="800" fill="#ff2e97" opacity=".14"/>
<svg x="1116" y="1116" width="500" height="500" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="300" fill="url(#kit)"/>${mark(13, 200, 200)}</svg>`;
await sharp(svg(2732, 2732, splash)).png().toFile('assets/splash.png');
await sharp(svg(2732, 2732, splash)).png().toFile('assets/splash-dark.png');
// Icônes de la version web (iPhone / navigateur)
import { mkdirSync } from 'node:fs';
mkdirSync('www/icons', { recursive: true });
const full = svg(1024, 1024, `${bg(1024)}${mark(13, 200, 200)}`);
for (const [n, sz] of [['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) await sharp(full).resize(sz, sz).png().toFile(`www/icons/${n}.png`);
console.log('ok');
