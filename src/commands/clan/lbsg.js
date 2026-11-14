import { SlashCommandBuilder } from 'discord.js';
import { queryBedrockServer } from '../../services/clanService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { CLAN, EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lbsg')
    .setDescription('Query real-time server status, player counts, and ping for Lifeboat Survival Mode')
    .addStringOption(opt =>
      opt.setName('custom_ip')
        .setDescription('Optional custom Bedrock server address (defaults to play.lbsg.net)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const customIp = interaction.options.getString('custom_ip') || CLAN.SERVER_IP;
    await interaction.deferReply();

    const data = await queryBedrockServer(customIp, CLAN.SERVER_PORT);

    if (!data.online) {
      const embed = AventusEmbed.error(
        'Server Unreachable',
        `Unable to reach **${customIp}:${CLAN.SERVER_PORT}** at this moment.\nError: \`${data.error || 'Server offline or timed out'}\``
      );
      return await interaction.editReply({ embeds: [embed] });
    }

    const embed = AventusEmbed.imperial(
      `${CLAN.NAME} — Lifeboat Server Pulse`,
      `📡 **Network Status:** \`ONLINE\` ✅\n` +
      `🌐 **Server IP:** \`${data.ip}:${data.port}\`\n` +
      `🎮 **Bedrock Version:** \`${data.version}\`\n` +
      `👥 **Active Warriors Online:** \`${data.players.online} / ${data.players.max}\`\n\n` +
      `### Server MOTD:\n\`\`\`\n${data.motd}\n\`\`\``
    );

    await interaction.editReply({ embeds: [embed] });
  }
};
