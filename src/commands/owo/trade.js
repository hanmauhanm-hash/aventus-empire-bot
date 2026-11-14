import { SlashCommandBuilder } from 'discord.js';
import { getUserProfile, addRewards } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Transfer Empire Gold to another clan comrade')
    .addUserOption(opt =>
      opt.setName('recipient')
        .setDescription('Clan member to transfer gold to')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Amount of Empire Gold to transfer')
        .setMinValue(10)
        .setRequired(true)
    ),

  async execute(interaction) {
    const recipient = interaction.options.getUser('recipient');
    const amount = interaction.options.getInteger('amount');

    if (recipient.id === interaction.user.id) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Invalid Transfer', 'You cannot transfer gold to yourself!')],
        ephemeral: true
      });
    }

    if (recipient.bot) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Invalid Transfer', 'Bots do not partake in clan finances!')],
        ephemeral: true
      });
    }

    const senderProfile = getUserProfile(interaction.user.id);
    if (senderProfile.gold < amount) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Insufficient Gold', `You only hold **${senderProfile.gold} $EG** in your vault.`)],
        ephemeral: true
      });
    }

    // Deduct from sender and give to recipient
    const senderResult = addRewards(interaction.user.id, -amount, 0);
    const receiverResult = addRewards(recipient.id, amount, 0);

    const embed = AventusEmbed.imperial(
      'Imperial Vault Transfer Completed',
      `👑 <@${interaction.user.id}> has transferred **${amount} Empire Gold** to <@${recipient.id}>!\n\n` +
      `• **Your New Balance:** \`${senderResult.newGold} $EG\`\n` +
      `• **Recipient Balance:** \`${receiverResult.newGold} $EG\``
    );

    await interaction.reply({ embeds: [embed] });
  }
};
