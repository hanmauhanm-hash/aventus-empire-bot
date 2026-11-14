import { SlashCommandBuilder } from 'discord.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { CLAN, EMOJIS } from '../../config/constants.js';
import os from 'os';

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Display information about the Aventus Empire Bot architecture'),

  async execute(interaction) {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = AventusEmbed.imperial(
      `${CLAN.NAME} — Bot Specifications`,
      `The vanguard bot powering the **${CLAN.NAME}** on Lifeboat Bedrock Survival.`
    )
    .addFields(
      { name: '👑 Clan', value: `${CLAN.NAME} ${CLAN.TAG}`, inline: true },
      { name: '🎮 Platform', value: `${CLAN.GAME_MODE}`, inline: true },
      { name: '📡 Lifeboat IP', value: `\`${CLAN.SERVER_IP}:${CLAN.SERVER_PORT}\``, inline: true },
      { name: '⏱️ Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
      { name: '💾 Memory', value: `${memoryUsage} MB`, inline: true },
      { name: '⚙️ Node / Engine', value: `Node.js ${process.version} (Discord.js v14)`, inline: true },
      { name: '✨ AI Core', value: 'Puter.js Multi-Model SDK', inline: true },
      { name: '🎨 Graphics Core', value: 'Sharp + @napi-rs/canvas', inline: true }
    );

    await interaction.reply({ embeds: [embed] });
  }
};
