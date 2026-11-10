// Génère les visuels source (icône + splash) pour @capacitor/assets
import sharp from 'sharp';
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2ff3ff"/><stop offset=".55" stop-color="#8b5cff"/><stop offset="1" stop-color="#ff4fd8"/></linearGradient>
<radialGradient id="h" cx=".3" cy=".2" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
const mark = (s, ox, oy) => `<g transform="translate(${ox},${oy}) scale(${s})"><path d="M3 40 17 17l8 11 6-8 14 20z" fill="#07070f"/><path d="m17 17 4 6.5-4 3-3.5-3z" fill="#fff" opacity=".85"/><circle cx="35" cy="11" r="5.5" fill="#07070f" opacity=".6"/></g>`;
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${grad}${body}</svg>`);

// Icône pleine
await sharp(svg(1024, 1024, `<rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#h)"/>${mark(13, 200, 200)}`)).png().toFile('assets/icon-only.png');
// Icône adaptative : avant-plan (zone sûre 66%) + arrière-plan
await sharp(svg(1024, 1024, `${mark(8.5, 308, 300)}`)).png().toFile('assets/icon-foreground.png');
await sharp(svg(1024, 1024, `<rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#h)"/>`)).png().toFile('assets/icon-background.png');
// Splash
const splash = `<rect width="2732" height="2732" fill="#07070f"/>
<circle cx="900" cy="900" r="900" fill="#8b5cff" opacity=".18"/><circle cx="1900" cy="1900" r="800" fill="#2ff3ff" opacity=".10"/>
<rect x="1116" y="1116" width="500" height="500" rx="150" fill="url(#g)"/>${mark(6.2, 1217, 1210)}`;
await sharp(svg(2732, 2732, splash)).blur(0.3).png().toFile('assets/splash.png');
await sharp(svg(2732, 2732, splash)).png().toFile('assets/splash-dark.png');
console.log('ok');
