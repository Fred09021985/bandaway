// Génère les visuels source (icône + splash) pour @capacitor/assets — thème PSG
import sharp from 'sharp';
const defs = `<defs>
<linearGradient id="kit" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#0a2f6e"/><stop offset=".35" stop-color="#0a2f6e"/>
  <stop offset=".35" stop-color="#ffffff"/><stop offset=".38" stop-color="#ffffff"/>
  <stop offset=".38" stop-color="#da291c"/><stop offset=".62" stop-color="#da291c"/>
  <stop offset=".62" stop-color="#ffffff"/><stop offset=".65" stop-color="#ffffff"/>
  <stop offset=".65" stop-color="#0a2f6e"/><stop offset="1" stop-color="#0a2f6e"/>
</linearGradient>
<radialGradient id="h" cx=".3" cy=".2" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
const mark = (s, ox, oy) => `<g transform="translate(${ox},${oy}) scale(${s})">
<path d="M3 40 17 17l8 11 6-8 14 20z" fill="#fff"/><path d="m17 17 4 6.5-4 3-3.5-3z" fill="#0a2f6e" opacity=".55"/><circle cx="35" cy="11" r="5.5" fill="#fff"/></g>`;
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`);
const bg = (w) => `<rect width="${w}" height="${w}" fill="url(#kit)"/><rect width="${w}" height="${w}" fill="url(#h)"/>`;

await sharp(svg(1024, 1024, `${bg(1024)}${mark(13, 200, 200)}`)).png().toFile('assets/icon-only.png');
await sharp(svg(1024, 1024, `${mark(8.5, 308, 300)}`)).png().toFile('assets/icon-foreground.png');
await sharp(svg(1024, 1024, bg(1024))).png().toFile('assets/icon-background.png');
const splash = `<rect width="2732" height="2732" fill="#040b18"/>
<circle cx="900" cy="900" r="900" fill="#0d47b8" opacity=".22"/><circle cx="1900" cy="1900" r="800" fill="#da291c" opacity=".14"/>
<svg x="1116" y="1116" width="500" height="500" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="300" fill="url(#kit)"/>${mark(13, 200, 200)}</svg>`;
await sharp(svg(2732, 2732, splash)).png().toFile('assets/splash.png');
await sharp(svg(2732, 2732, splash)).png().toFile('assets/splash-dark.png');
console.log('ok');
