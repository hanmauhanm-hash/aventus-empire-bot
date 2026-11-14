import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { generateWelcomeCard } from '../../services/canvasService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { CLAN, EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('test-welcome')
    .setDescription('Simulate and preview the dynamic Imperial Welcome Card'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const cardBuffer = await generateWelcomeCard(interaction.member);
      const attachment = new AttachmentBuilder(cardBuffer, { name: 'aventus_welcome.png' });

      const embed = AventusEmbed.imperial(
        `Welcome to the ${CLAN.NAME}!`,
        `${EMOJIS.CROWN} Hail <@${interaction.user.id}>! You have stepped into the stronghold of the **${CLAN.NAME}** on Lifeboat Survival Mode.\n\n` +
        `• **Server IP:** \`${CLAN.SERVER_IP}:${CLAN.SERVER_PORT}\`\n` +
        `• **Clan Motto:** *"${CLAN.MOTTO}"*\n` +
        `• Make sure to check our coordinate rules and prepare for clan raids!`
      )
      .setImage('attachment://aventus_welcome.png');

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error('Welcome card generation error:', err);
      await interaction.editReply({ content: `Failed to generate welcome card: ${err.message}` });
    }
  }
};
