import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

async function processLogo() {
  const inputPath = path.resolve('public/logo.png');
  const outputPath = path.resolve('public/logo-transparent.png');

  const img = await loadImage(inputPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;

  // Process pixels:
  // Convert white/light background to transparent
  // Convert black text/shapes to pure white for dark UI, keep blue pillar vibrant
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Detect white/light background (r>220, g>220, b>220)
    if (r > 220 && g > 220 && b > 220) {
      data[i + 3] = 0; // Alpha = 0 (Transparent)
    } else {
      // Check if it's the blue pillar (b > r + 30 and b > 100)
      const isBlue = b > r + 30 && b > g + 10;
      if (!isBlue) {
        // Convert black text/outline to crisp white (#FFFFFF)
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        // Enhance electric blue
        data[i] = 37;
        data[i + 1] = 99;
        data[i + 2] = 235;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const out = fs.createWriteStream(outputPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  out.on('finish', () => console.log('Created logo-transparent.png successfully!'));
}

processLogo().catch(console.error);
