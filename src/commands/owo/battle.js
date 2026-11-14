import { SlashCommandBuilder } from 'discord.js';
import { simulateBattle } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('battle')
    .setDescription('Lead your top captured beasts into turn-based combat against a Lifeboat raid boss')
    .addStringOption(opt =>
      opt.setName('boss')
        .setDescription('Select the target dungeon boss')
        .setRequired(false)
        .addChoices(
          { name: 'Lifeboat Void Destroyer', value: 'Lifeboat Void Destroyer' },
          { name: 'Ancient Nether Fortress Colossus', value: 'Ancient Nether Fortress Colossus' },
          { name: 'Abyssal Elder Guardian', value: 'Abyssal Elder Guardian' }
        )
    ),

  async execute(interaction) {
    const bossName = interaction.options.getString('boss') || 'Lifeboat Void Destroyer';
    const result = simulateBattle(interaction.user.id, bossName);

    if (result.error) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Battle Squad Missing', result.error)],
        ephemeral: true
      });
    }

    const { victory, team, rounds, logs, goldReward, xpReward } = result;

    const squadNames = team.map(t => `${t.name} (x${t.count})`).join(', ');
    const logSummary = logs.slice(0, 6).join('\n');

    const embed = victory
      ? AventusEmbed.success(
          `VICTORY! ${bossName} Defeated!`,
          `⚔️ **Your Vanguard Squad:** ${squadNames}\n` +
          `🛡️ **Combat Rounds:** ${rounds}\n\n` +
          `### Battle Log:\n${logSummary}\n\n` +
          `**Imperial Spoils of War:**\n` +
          `• ${EMOJIS.COIN} **+${goldReward}** Empire Gold\n` +
          `• ✨ **+${xpReward}** Clan XP`
        )
      : AventusEmbed.error(
          `DEFEAT! Your Squad Fell to ${bossName}`,
          `⚔️ **Your Squad:** ${squadNames}\n\n` +
          `### Battle Log:\n${logSummary}\n\n` +
          `*Your beasts retreated to the imperial infirmary to recover. You earned **+${xpReward} XP** for battle resilience.*`
        );

    await interaction.reply({ embeds: [embed] });
  }
};
