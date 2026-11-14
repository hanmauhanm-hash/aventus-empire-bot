import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import db from '../../config/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config-leave')
    .setDescription('Configure the imperial departure / leave log channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel where departure cards and logs are sent')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    db.prepare(`
      INSERT INTO guild_settings (guild_id, leave_channel_id)
      VALUES (?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        leave_channel_id = excluded.leave_channel_id,
        updated_at = CURRENT_TIMESTAMP
    `).run(interaction.guildId, channel.id);

    const embed = AventusEmbed.success(
      'Imperial Departure Log Updated',
      `🛡️ **Leave Log Channel:** ${channel}\nDeparting warriors will now be logged here with dynamic visual cards.`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
