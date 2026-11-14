import { SlashCommandBuilder } from 'discord.js';
import { getUserProfile, addRewards } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

const SYMBOLS = ['💎', '👑', '🗡️', '🐉', '❇️', '💀'];

export default {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Spin the Imperial Slot Machine for massive multipliers')
    .addIntegerOption(opt =>
      opt.setName('bet')
        .setDescription('Amount of Empire Gold to wager')
        .setMinValue(20)
        .setMaxValue(50000)
        .setRequired(true)
    ),

  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = getUserProfile(interaction.user.id);

    if (user.gold < bet) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Insufficient Gold', `You need **${bet} $EG** to spin, but you only have **${user.gold} $EG**.`)],
        ephemeral: true
      });
    }

    const reel1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const reel2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const reel3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    let multiplier = 0;
    if (reel1 === reel2 && reel2 === reel3) {
      multiplier = reel1 === '👑' ? 10 : (reel1 === '💎' ? 7 : 5);
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      multiplier = 1.5;
    }

    const displayReels = `[ ${reel1} | ${reel2} | ${reel3} ]`;

    if (multiplier > 0) {
      const netGain = Math.floor(bet * multiplier) - bet;
      const reward = addRewards(interaction.user.id, netGain, 15);

      const embed = AventusEmbed.success(
        '🎰 JACKPOT! Imperial Slots Payout!',
        `### ${displayReels}\n\n` +
        `• **Multiplier:** \`${multiplier}x\`\n` +
        `• 💰 **Winnings:** \`+${Math.floor(bet * multiplier)} $EG\`\n` +
        `• 🪙 **New Vault Balance:** \`${reward.newGold} $EG\``
      );
      await interaction.reply({ embeds: [embed] });
    } else {
      const reward = addRewards(interaction.user.id, -bet, 2);

      const embed = AventusEmbed.error(
        '🎰 No Match! Imperial Slots',
        `### ${displayReels}\n\n` +
        `• 💸 **Lost Bet:** \`-${bet} $EG\`\n` +
        `• 🪙 **Remaining Vault:** \`${reward.newGold} $EG\``
      );
      await interaction.reply({ embeds: [embed] });
    }
  }
};
