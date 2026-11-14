import { SlashCommandBuilder } from 'discord.js';
import db from '../../config/database.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View top Aventus Empire warriors in gold, rank level, and hunts')
    .addStringOption(opt =>
      opt.setName('category')
        .setDescription('Ranking category')
        .setRequired(false)
        .addChoices(
          { name: '🪙 Wealthiest (Empire Gold)', value: 'gold' },
          { name: '⭐ Clan Level (XP)', value: 'level' },
          { name: '🏹 Master Hunters (Hunts)', value: 'hunt_count' }
        )
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category') || 'gold';
    const topUsers = db.prepare(`SELECT * FROM users ORDER BY ${category} DESC LIMIT 10`).all();

    if (topUsers.length === 0) {
      return await interaction.reply({
        embeds: [AventusEmbed.owo('Imperial Leaderboard', 'No warriors have entered the clan archives yet.')]
      });
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    const rows = topUsers.map((u, i) => {
      const valStr = category === 'gold'
        ? `\`${u.gold} $EG\``
        : (category === 'level' ? `\`Level ${u.level}\` (${u.xp} XP)` : `\`${u.hunt_count} Hunts\``);

      return `${medals[i] || '•'} <@${u.user_id}> — ${valStr}`;
    }).join('\n');

    const catTitle = category === 'gold' ? 'Wealthiest Nobles' : (category === 'level' ? 'Highest Clan Ranks' : 'Greatest Hunters');

    const embed = AventusEmbed.imperial(
      `${EMOJIS.TROPHY} Imperial Hall of Fame — ${catTitle}`,
      rows
    );

    await interaction.reply({ embeds: [embed] });
  }
};
