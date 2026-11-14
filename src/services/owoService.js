import db from '../config/database.js';
import { OWO_RARITIES, EMOJIS } from '../config/constants.js';

// Mobs and Imperial Beasts database
export const BEASTS = [
  // COMMON (50%)
  { id: 'cow', name: 'Highland Cow', rarity: 'COMMON', power: 12, hp: 45, emoji: '🐄' },
  { id: 'pig', name: 'Muddy Pig', rarity: 'COMMON', power: 10, hp: 40, emoji: '🐖' },
  { id: 'sheep', name: 'Imperial Sheep', rarity: 'COMMON', power: 8, hp: 35, emoji: '🐑' },
  { id: 'chicken', name: 'Scout Chicken', rarity: 'COMMON', power: 6, hp: 25, emoji: '🐔' },
  { id: 'zombie', name: 'Survival Zombie', rarity: 'COMMON', power: 15, hp: 50, emoji: '🧟' },
  { id: 'skeleton', name: 'Bone Archer', rarity: 'COMMON', power: 18, hp: 45, emoji: '💀' },
  { id: 'spider', name: 'Cave Spider', rarity: 'COMMON', power: 16, hp: 40, emoji: '🕷️' },

  // UNCOMMON (25%)
  { id: 'wolf', name: 'Aventus Direwolf', rarity: 'UNCOMMON', power: 28, hp: 70, emoji: '🐺' },
  { id: 'creeper', name: 'Charged Creeper', rarity: 'UNCOMMON', power: 45, hp: 50, emoji: '💣' },
  { id: 'enderman', name: 'Void Walker Enderman', rarity: 'UNCOMMON', power: 35, hp: 80, emoji: '🔮' },
  { id: 'iron_golem', name: 'Citadel Iron Golem', rarity: 'UNCOMMON', power: 40, hp: 120, emoji: '🤖' },
  { id: 'phantom', name: 'Nightmare Phantom', rarity: 'UNCOMMON', power: 30, hp: 60, emoji: '🦇' },

  // RARE (14%)
  { id: 'blaze', name: 'Infernal Blaze', rarity: 'RARE', power: 55, hp: 100, emoji: '🔥' },
  { id: 'ravager', name: 'War Ravager', rarity: 'RARE', power: 65, hp: 160, emoji: '🦏' },
  { id: 'shulker', name: 'End Fortress Shulker', rarity: 'RARE', power: 50, hp: 130, emoji: '📦' },
  { id: 'witch', name: 'Alchemist Witch', rarity: 'RARE', power: 52, hp: 95, emoji: '🧙' },

  // EPIC (7%)
  { id: 'wither_skeleton', name: 'Nether Wither Champion', rarity: 'EPIC', power: 85, hp: 180, emoji: '🗡️' },
  { id: 'elder_guardian', name: 'Abyssal Elder Guardian', rarity: 'EPIC', power: 90, hp: 210, emoji: '🐡' },
  { id: 'evoker', name: 'Totem Evoker Priest', rarity: 'EPIC', power: 95, hp: 175, emoji: '🔮' },

  // MYTHIC (3.5%)
  { id: 'warden', name: 'Deep Dark Ancient Warden', rarity: 'MYTHIC', power: 160, hp: 350, emoji: '👾' },
  { id: 'netherite_golem', name: 'Aventus Netherite Colossus', rarity: 'MYTHIC', power: 180, hp: 400, emoji: '⬛' },
  { id: 'ender_dragon', name: 'Ender Dragon Monarch', rarity: 'MYTHIC', power: 210, hp: 450, emoji: '🐉' },

  // LEGENDARY (0.5%)
  { id: 'imperial_dragon', name: 'Aventus Imperial Sovereign Dragon', rarity: 'LEGENDARY', power: 350, hp: 800, emoji: '👑' },
  { id: 'cosmic_titan', name: 'Lifeboat Void Destroyer', rarity: 'LEGENDARY', power: 400, hp: 900, emoji: '🌌' }
];

/**
 * Get or create user profile
 */
export function getUserProfile(userId) {
  let user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) {
    db.prepare('INSERT INTO users (user_id, gold, bank, xp, level, hunt_count) VALUES (?, 250, 0, 0, 1, 0)').run(userId);
    user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  }
  return user;
}

/**
 * Update user gold & XP with auto-leveling
 */
export function addRewards(userId, goldEarned, xpEarned) {
  const user = getUserProfile(userId);
  const newGold = Math.max(0, user.gold + goldEarned);
  const newXp = user.xp + xpEarned;
  const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

  db.prepare(`
    UPDATE users 
    SET gold = ?, xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(newGold, newXp, newLevel, userId);

  return { newGold, newXp, newLevel, leveledUp: newLevel > user.level };
}

/**
 * Execute OwO Hunt: Random drop from beasts table
 */
export function executeHunt(userId) {
  const user = getUserProfile(userId);

  // Roll rarity
  const roll = Math.random();
  let selectedRarity = 'COMMON';

  if (roll <= OWO_RARITIES.LEGENDARY.chance) {
    selectedRarity = 'LEGENDARY';
  } else if (roll <= OWO_RARITIES.MYTHIC.chance) {
    selectedRarity = 'MYTHIC';
  } else if (roll <= OWO_RARITIES.EPIC.chance) {
    selectedRarity = 'EPIC';
  } else if (roll <= OWO_RARITIES.RARE.chance) {
    selectedRarity = 'RARE';
  } else if (roll <= OWO_RARITIES.UNCOMMON.chance) {
    selectedRarity = 'UNCOMMON';
  }

  // Filter beasts by selected rarity
  const candidates = BEASTS.filter(b => b.rarity === selectedRarity);
  const beast = candidates[Math.floor(Math.random() * candidates.length)] || BEASTS[0];

  // Calculate rewards
  const rarityConfig = OWO_RARITIES[beast.rarity];
  const goldEarned = Math.floor((Math.random() * 25 + 15) * rarityConfig.multiplier);
  const xpEarned = Math.floor(10 * rarityConfig.multiplier);

  // Add beast to inventory
  const existing = db.prepare('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?').get(userId, beast.id);
  if (existing) {
    db.prepare('UPDATE inventory SET count = count + 1 WHERE id = ?').run(existing.id);
  } else {
    db.prepare(`
      INSERT INTO inventory (user_id, item_id, name, rarity, attack, hp, count)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(userId, beast.id, beast.name, beast.rarity, beast.power, beast.hp);
  }

  // Increment hunt count & rewards
  db.prepare('UPDATE users SET hunt_count = hunt_count + 1 WHERE user_id = ?').run(userId);
  const rewardResult = addRewards(userId, goldEarned, xpEarned);

  return {
    beast,
    goldEarned,
    xpEarned,
    rewardResult
  };
}

/**
 * Get user's captured zoo animals
 */
export function getUserZoo(userId) {
  return db.prepare('SELECT * FROM inventory WHERE user_id = ? ORDER BY attack DESC').all(userId);
}

/**
 * Simulate turn-based battle
 */
export function simulateBattle(userId, targetBossName = 'Lifeboat Survival Void Titan') {
  const zoo = getUserZoo(userId);
  const user = getUserProfile(userId);

  if (zoo.length === 0) {
    return { error: 'You have no beasts in your zoo to battle with! Use `/hunt` first.' };
  }

  // Pick top 3 strongest beasts
  const team = zoo.slice(0, 3);
  let teamTotalHp = team.reduce((acc, b) => acc + b.hp * b.count, 0);
  let teamTotalAtk = team.reduce((acc, b) => acc + b.attack, 0);

  // Boss Stats scaled to user level
  let bossHp = 250 + user.level * 40;
  let bossAtk = 30 + user.level * 8;

  const logs = [];
  let rounds = 0;
  let victory = false;

  while (teamTotalHp > 0 && bossHp > 0 && rounds < 10) {
    rounds++;

    // User team attacks
    const crit = Math.random() < 0.25;
    const dmgToBoss = Math.floor((teamTotalAtk * (0.85 + Math.random() * 0.3)) * (crit ? 1.5 : 1.0));
    bossHp -= dmgToBoss;
    logs.push(`Round ${rounds}: Your squad attacked for **${dmgToBoss} DMG**${crit ? ' 💥 CRITICAL!' : ''}`);

    if (bossHp <= 0) {
      victory = true;
      break;
    }

    // Boss attacks team
    const bossCrit = Math.random() < 0.2;
    const dmgToTeam = Math.floor((bossAtk * (0.8 + Math.random() * 0.4)) * (bossCrit ? 1.4 : 1.0));
    teamTotalHp -= dmgToTeam;
    logs.push(`Round ${rounds}: **${targetBossName}** counter-attacked for **${dmgToTeam} DMG**!`);

    if (teamTotalHp <= 0) {
      victory = false;
      break;
    }
  }

  if (rounds >= 10 && !victory) {
    victory = bossHp < teamTotalHp;
  }

  let goldReward = 0;
  let xpReward = 0;

  if (victory) {
    goldReward = Math.floor(150 + user.level * 25);
    xpReward = Math.floor(50 + user.level * 15);
    addRewards(userId, goldReward, xpReward);
  } else {
    xpReward = 15;
    addRewards(userId, 0, xpReward);
  }

  return {
    victory,
    team,
    bossName: targetBossName,
    rounds,
    logs,
    goldReward,
    xpReward
  };
}
