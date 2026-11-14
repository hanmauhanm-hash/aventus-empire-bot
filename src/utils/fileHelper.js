import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TEMP_DIR = path.resolve(__dirname, '../../temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Download a remote URL (e.g. Discord CDN attachment) to a local file
 */
export async function downloadFile(url, targetPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(targetPath);
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      // Follow 301/302 redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, targetPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(targetPath, () => {});
        return reject(new Error(`Download failed with status: ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(targetPath));
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(targetPath, () => {});
      reject(err);
    });
  });
}

/**
 * Remove temporary files or directories safely
 */
export function cleanupPath(targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Error cleaning up ${targetPath}:`, err.message);
  }
}
