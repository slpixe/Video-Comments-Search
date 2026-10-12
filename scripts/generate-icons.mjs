import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Export every size from the approved imagegen master, retaining its alpha.
// Uses the project's existing Chromium dependency; no image library required.
const root = new URL('../', import.meta.url);
const master = await readFile(new URL('assets/branding/sculpted-coral-master.png', root));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const exports = await page.evaluate(async source => {
    const image = new Image();
    image.src = source;
    await image.decode();
    function png(size, background, scale = 1) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size, size);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const inset = size * (1 - scale) / 2;
      ctx.drawImage(image, inset, inset, size * scale, size * scale);
      return canvas.toDataURL('image/png').split(',')[1];
    }
    // Safari pinned tabs require a monochrome vector mask. Trace horizontal
    // alpha runs, with the ivory play symbol knocked out of the silhouette.
    const mask = document.createElement('canvas');
    mask.width = mask.height = 256;
    const maskCtx = mask.getContext('2d');
    maskCtx.drawImage(image, 0, 0, 256, 256);
    const pixels = maskCtx.getImageData(0, 0, 256, 256).data;
    let path = '';
    for (let y = 0; y < 256; y++) {
      let start = -1;
      for (let x = 0; x <= 256; x++) {
        const i = (y * 256 + x) * 4;
        const ivory = pixels[i] > 210 && pixels[i + 1] > 200 && pixels[i + 2] > 175 && pixels[i] - pixels[i + 2] < 65;
        const filled = x < 256 && pixels[i + 3] >= 128 && !ivory;
        if (filled && start < 0) start = x;
        if (!filled && start >= 0) {
          path += `M${start} ${y}h${x - start}v1H${start}z`;
          start = -1;
        }
      }
    }
    return {
      sizes: Object.fromEntries([16, 24, 32, 48, 64, 150, 192, 256, 512].map(size => [size, png(size)])),
      apple: png(180, '#fff8f0', 0.86),
      // Keep all artwork inside the central 80%-diameter maskable safe circle.
      maskable: png(512, '#fff8f0', 0.60),
      pinned: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${path}"/></svg>\n`,
    };
  }, `data:image/png;base64,${master.toString('base64')}`);

  const files = {
    'favicon-16x16.png': exports.sizes[16],
    'favicon-32x32.png': exports.sizes[32],
    'favicon-48x48.png': exports.sizes[48],
    'logo-64.png': exports.sizes[64],
    'logo-192.png': exports.sizes[192],
    'logo-512.png': exports.sizes[512],
    'android-chrome-192x192.png': exports.sizes[192],
    'android-chrome-512x512.png': exports.sizes[512],
    'icon-maskable-512.png': exports.maskable,
    'apple-touch-icon.png': exports.apple,
    'mstile-150x150.png': exports.sizes[150],
  };
  for (const [name, data] of Object.entries(files)) {
    await writeFile(new URL(`public/${name}`, root), Buffer.from(data, 'base64'));
  }
  await writeFile(new URL('public/safari-pinned-tab.svg', root), exports.pinned);

  // ICO directory followed by lossless PNG entries (including tiny native sizes).
  const sizes = [16, 24, 32, 48, 64, 256];
  const images = sizes.map(size => Buffer.from(exports.sizes[size], 'base64'));
  const directory = Buffer.alloc(6 + 16 * sizes.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  sizes.forEach((size, index) => {
    const entry = 6 + index * 16;
    directory[entry] = directory[entry + 1] = size === 256 ? 0 : size;
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(images[index].length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += images[index].length;
  });
  await writeFile(new URL('public/favicon.ico', root), Buffer.concat([directory, ...images]));
  console.log(`Exported ${Object.keys(files).length} PNGs and a six-size favicon.ico.`);
} finally {
  await browser.close();
}
