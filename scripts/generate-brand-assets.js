/* Rasterises assets/brand/*.svg into the PNGs Expo expects.
 * Usage: node scripts/generate-brand-assets.js  (needs `sharp`; set SHARP_PATH if it is not resolvable) */
const path = require('path');
const fs = require('fs');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const root = path.resolve(__dirname, '..'); // eslint-disable-line no-undef
const svg = name => fs.readFileSync(path.join(root, 'assets/brand', name));
const out = (name, input, size) =>
  sharp(input, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(root, 'assets', name));
(async () => {
  await out('icon.png', svg('icon-square.svg'), 1024);
  await out('logo.png', svg('icon.svg'), 1024);
  await out('logoApp.png', svg('icon.svg'), 512);
  await out('adaptive-icon.png', svg('adaptive-foreground.svg'), 1024);
  await out('splash-icon.png', svg('splash-mark.svg'), 1024);
  console.log('brand assets generated');
})();
