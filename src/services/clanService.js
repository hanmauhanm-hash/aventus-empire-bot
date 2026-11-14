import db from '../config/database.js';
import https from 'https';

/**
 * Add a coordinate bookmark
 */
export function addWaypoint({ guildId, userId, name, x, y, z, dimension = 'Overworld', isClan = false, note = '' }) {
  const stmt = db.prepare(`
    INSERT INTO waypoints (guild_id, user_id, name, x, y, z, dimension, is_clan, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(guildId, userId, name, Math.round(x), Math.round(y), Math.round(z), dimension, isClan ? 1 : 0, note);
  return result.lastInsertRowid;
}

/**
 * Get all waypoints visible to a user
 */
export function getWaypoints(guildId, userId) {
  return db.prepare(`
    SELECT * FROM waypoints 
    WHERE guild_id = ? AND (user_id = ? OR is_clan = 1)
    ORDER BY is_clan DESC, created_at DESC
  `).all(guildId, userId);
}

/**
 * Delete a waypoint
 */
export function deleteWaypoint(waypointId, userId) {
  const wp = db.prepare('SELECT * FROM waypoints WHERE id = ?').get(waypointId);
  if (!wp) return { success: false, error: 'Waypoint not found.' };
  if (wp.user_id !== userId) return { success: false, error: 'You do not own this waypoint.' };

  db.prepare('DELETE FROM waypoints WHERE id = ?').run(waypointId);
  return { success: true };
}

/**
 * Convert coordinates between Overworld and Nether
 */
export function convertDimensionCoords(x, y, z, currentDim = 'Overworld') {
  if (currentDim.toLowerCase().includes('nether')) {
    return {
      dimension: 'Overworld',
      x: x * 8,
      y: y,
      z: z * 8
    };
  } else {
    return {
      dimension: 'Nether',
      x: Math.round(x / 8),
      y: y,
      z: Math.round(z / 8)
    };
  }
}

/**
 * Query Minecraft Bedrock Server status (e.g. play.lbsg.net)
 */
export async function queryBedrockServer(host = 'play.lbsg.net', port = 19132) {
  return new Promise((resolve) => {
    const url = `https://api.mcsrvstat.us/bedrock/3/${host}:${port}`;
    https.get(url, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({
            online: parsed.online,
            ip: parsed.ip || host,
            port: parsed.port || port,
            hostname: parsed.hostname || host,
            version: parsed.version || 'Bedrock Latest',
            players: {
              online: parsed.players?.online || 0,
              max: parsed.players?.max || 0
            },
            motd: parsed.motd?.clean ? parsed.motd.clean.join('\n') : (parsed.motd?.raw ? parsed.motd.raw.join('\n') : 'Lifeboat Survival Mode')
          });
        } catch (e) {
          resolve({
            online: false,
            ip: host,
            port: port,
            error: 'Failed to parse server response'
          });
        }
      });
    }).on('error', (err) => {
      resolve({
        online: false,
        ip: host,
        port: port,
        error: err.message
      });
    });
  });
}
