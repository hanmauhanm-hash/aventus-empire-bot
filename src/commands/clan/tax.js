import { SlashCommandBuilder } from 'discord.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tax')
    .setDescription('Calculate Lifeboat survival market taxes and net trade profits')
    .addIntegerOption(opt =>
      opt.setName('price')
        .setDescription('Total transaction or item sale price')
        .setMinValue(1)
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('tax_percent')
        .setDescription('Tax percentage rate (defaults to Lifeboat standard 10%)')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(false)
    ),

  async execute(interaction) {
    const price = interaction.options.getInteger('price');
    const taxRate = interaction.options.getInteger('tax_percent') ?? 10;

    const taxAmount = Math.ceil((price * taxRate) / 100);
    const netProceeds = price - taxAmount;

    const embed = AventusEmbed.imperial(
      'Lifeboat Survival Trade Ledger',
      `Financial assessment for market trade of **${price.toLocaleString()} coins**:\n\n` +
      `• **Gross Sale Price:** \`${price.toLocaleString()} coins\`\n` +
      `• **Market Tax (${taxRate}%):** \`-${taxAmount.toLocaleString()} coins\`\n` +
      `• 💰 **Net Profit to Seller:** \`+${netProceeds.toLocaleString()} coins\`\n\n` +
      `💡 *Tip: To receive exactly \`${price.toLocaleString()}\` after taxes, list your item for \`${Math.ceil(price / (1 - taxRate / 100)).toLocaleString()} coins\`!*`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
