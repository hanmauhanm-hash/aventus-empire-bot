import { SlashCommandBuilder } from 'discord.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot latency and Discord API heartbeat'),

  async execute(interaction) {
    const sent = await interaction.deferReply({ fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    const embed = AventusEmbed.imperial(
      'Imperial Vanguard Latency',
      `${EMOJIS.SWORD} **Gateway Latency:** \`${roundtrip}ms\`\n${EMOJIS.FIRE} **WebSocket Heartbeat:** \`${wsLatency}ms\``
    );

    await interaction.editReply({ embeds: [embed] });
  }
};
