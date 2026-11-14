import { SlashCommandBuilder } from 'discord.js';
import { getUserProfile, addRewards } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip an Imperial Gold Sovereign to double or lose your wager')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Amount of Empire Gold to bet')
        .setMinValue(10)
        .setMaxValue(100000)
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('choice')
        .setDescription('Heads or Tails')
        .setRequired(true)
        .addChoices(
          { name: '👑 Heads (Empire Seal)', value: 'heads' },
          { name: '⚔️ Tails (Twin Blades)', value: 'tails' }
        )
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const choice = interaction.options.getString('choice');
    const user = getUserProfile(interaction.user.id);

    if (user.gold < amount) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Insufficient Gold', `You only hold **${user.gold} $EG** in your vault. You cannot bet **${amount} $EG**.`)],
        ephemeral: true
      });
    }

    const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = outcome === choice;

    if (won) {
      const reward = addRewards(interaction.user.id, amount, 10);
      const embed = AventusEmbed.success(
        'Coinflip Victory!',
        `The coin landed on **${outcome.toUpperCase()}**!\n\n` +
        `• 💰 **Winnings:** \`+${amount} $EG\`\n` +
        `• 🪙 **New Vault Balance:** \`${reward.newGold} Empire Gold\``
      );
      await interaction.reply({ embeds: [embed] });
    } else {
      const reward = addRewards(interaction.user.id, -amount, 2);
      const embed = AventusEmbed.error(
        'Coinflip Defeat!',
        `The coin landed on **${outcome.toUpperCase()}** (You picked ${choice.toUpperCase()}).\n\n` +
        `• 💸 **Lost:** \`-${amount} $EG\`\n` +
        `• 🪙 **Remaining Balance:** \`${reward.newGold} Empire Gold\``
      );
      await interaction.reply({ embeds: [embed] });
    }
  }
};
