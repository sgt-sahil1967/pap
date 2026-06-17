import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createWriteStream } from 'fs';
import https from 'https';
import http from 'http';
import imagesJson from '../../artifacts/papillon-store/src/data/images.json' assert { type: 'json' };

const OUTPUT_DIR = join(process.cwd(), 'attached_assets', 'product-images');
mkdirSync(OUTPUT_DIR, { recursive: true });

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (existsSync(dest)) {
      resolve();
      return;
    }
    const file = createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout: ' + url)); });
  });
}

async function main() {
  console.log(`Downloading ${imagesJson.length} images...`);
  let success = 0, failed = 0;
  
  for (const item of imagesJson as Array<{handle: string; url: string; filename: string}>) {
    const dest = join(OUTPUT_DIR, item.filename);
    try {
      await downloadFile(item.url, dest);
      success++;
      if (success % 20 === 0) console.log(`Progress: ${success}/${imagesJson.length}`);
    } catch (e) {
      failed++;
      console.error(`FAILED: ${item.url}: ${(e as Error).message}`);
    }
  }
  
  console.log(`Done: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
