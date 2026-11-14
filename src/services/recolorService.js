import sharp from 'sharp';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { TEMP_DIR, cleanupPath } from '../utils/fileHelper.js';

/**
 * Parse Hex string (#RRGGBB) to [r, g, b]
 */
export function hexToRgb(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [231, 76, 60]; // default ruby
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Recolor an individual PNG image buffer preserving luminosity, shadows, and transparency
 */
export async function recolorImageBuffer(imageBuffer, targetHex, options = {}) {
  const [targetR, targetG, targetB] = hexToRgb(targetHex);
  const { onlyDiamond = true } = options;

  const image = sharp(imageBuffer);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels; // 3 (RGB) or 4 (RGBA)

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = channels === 4 ? data[i + 3] : 255;

    // Skip transparent or near-invisible pixels
    if (a < 15) continue;

    // Luminance formula
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Keep black / dark outline intact for Minecraft pixel art style
    if (lum < 35) continue;

    // If onlyDiamond filter is enabled, check if the pixel matches cyan/blue diamond tones or stick/wood
    if (onlyDiamond) {
      // Wood/sticks usually have higher Red than Blue (r > b)
      const isWoodHandle = r > b && r > 100 && b < 100;
      if (isWoodHandle) continue;

      // Check if pixel has cyan/teal tint (b >= r) or is bright white highlight
      const isCyanTeal = b >= r && (g > 100 || b > 120);
      const isHighlight = lum > 210 && Math.abs(r - b) < 40;
      if (!isCyanTeal && !isHighlight) continue;
    }

    // Blend target color based on luminosity
    const factor = lum / 255;
    data[i] = Math.min(255, Math.round(targetR * factor * 1.15));
    data[i + 1] = Math.min(255, Math.round(targetG * factor * 1.15));
    data[i + 2] = Math.min(255, Math.round(targetB * factor * 1.15));
  }

  return await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).png().toBuffer();
}

/**
 * Recolor a full texturepack (.zip or .mcpack) for Diamond armor and tools
 */
export async function recolorPack(inputPackPath, targetHex, gearType = 'diamond') {
  const sessionId = uuidv4();
  const extractDir = path.join(TEMP_DIR, `recolor_extract_${sessionId}`);
  const outputPackPath = path.join(TEMP_DIR, `Recolored_${gearType}_${Date.now()}.mcpack`);

  fs.mkdirSync(extractDir, { recursive: true });

  try {
    const zip = new AdmZip(inputPackPath);
    zip.extractAllTo(extractDir, true);

    const diamondKeywords = [
      'diamond_helmet', 'diamond_chestplate', 'diamond_leggings', 'diamond_boots',
      'diamond_sword', 'diamond_pickaxe', 'diamond_axe', 'diamond_shovel', 'diamond_hoe',
      'diamond_layer_1', 'diamond_layer_2', 'diamond_1', 'diamond_2'
    ];

    let recoloredCount = 0;

    async function walkAndRecolor(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        if (item.isDirectory()) {
          await walkAndRecolor(fullPath);
        } else if (item.isFile() && item.name.endsWith('.png')) {
          const lowerName = item.name.toLowerCase();
          const shouldRecolor = diamondKeywords.some(keyword => lowerName.includes(keyword));

          if (shouldRecolor) {
            try {
              const fileBuf = fs.readFileSync(fullPath);
              const recoloredBuf = await recolorImageBuffer(fileBuf, targetHex, { onlyDiamond: true });
              fs.writeFileSync(fullPath, recoloredBuf);
              recoloredCount++;
            } catch (err) {
              console.error(`Failed to recolor ${item.name}:`, err.message);
            }
          }
        }
      }
    }

    await walkAndRecolor(extractDir);

    // Repack as .mcpack
    const outZip = new AdmZip();
    outZip.addLocalFolder(extractDir);
    outZip.writeZip(outputPackPath);

    return {
      outputPackPath,
      recoloredCount
    };
  } finally {
    cleanupPath(extractDir);
  }
}
