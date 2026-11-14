import { SlashCommandBuilder } from 'discord.js';
import { askAdvisor } from '../../services/puterService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Consult the Aventus Imperial AI Advisor powered by Puter.js')
    .addStringOption(opt =>
      opt.setName('question')
        .setDescription('Your strategic question regarding Lifeboat survival, Bedrock PvP, or clan tactics')
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    await interaction.deferReply();

    const response = await askAdvisor(question);

    const embed = AventusEmbed.ai(
      'Imperial Tactical Advisory',
      `**Inquiry:** *"${question}"*\n\n${response}`
    );

    await interaction.editReply({ embeds: [embed] });
  }
};
