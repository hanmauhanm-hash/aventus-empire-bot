import { SlashCommandBuilder } from 'discord.js';
import { executeHunt } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { OWO_RARITIES, EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Venture into the Lifeboat survival wilderness to capture beasts and earn gold'),

  async execute(interaction) {
    const result = executeHunt(interaction.user.id);
    const { beast, goldEarned, xpEarned, rewardResult } = result;
    const rarityConfig = OWO_RARITIES[beast.rarity];

    const embed = AventusEmbed.owo(
      `Wilderness Expedition — Beast Captured!`,
      `<@${interaction.user.id}> ventured into the wild lands of Lifeboat Survival...\n\n` +
      `### ${beast.emoji} **${beast.name}**\n` +
      `• **Rarity:** \`${rarityConfig.name}\`\n` +
      `• **Combat Power:** \`${beast.power} ATK\` | \`${beast.hp} HP\`\n\n` +
      `**Rewards Gained:**\n` +
      `• ${EMOJIS.COIN} **+${goldEarned}** Empire Gold (Balance: \`${rewardResult.newGold} $EG\`)\n` +
      `• ✨ **+${xpEarned}** XP (Level: \`${rewardResult.newLevel}\`)${rewardResult.leveledUp ? '\n🎉 **LEVEL UP!** You reached a new clan rank!' : ''}`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
