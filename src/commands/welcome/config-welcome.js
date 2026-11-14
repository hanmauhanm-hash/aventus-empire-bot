import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import db from '../../config/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config-welcome')
    .setDescription('Configure the imperial welcome channel and auto-role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel where welcome cards and greetings are sent')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName('autorole')
        .setDescription('Role automatically granted to new members (e.g. Recruit)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('autorole');

    db.prepare(`
      INSERT INTO guild_settings (guild_id, welcome_channel_id, autorole_id)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        welcome_channel_id = excluded.welcome_channel_id,
        autorole_id = COALESCE(excluded.autorole_id, guild_settings.autorole_id),
        updated_at = CURRENT_TIMESTAMP
    `).run(interaction.guildId, channel.id, role ? role.id : null);

    const embed = AventusEmbed.success(
      'Imperial Welcome Configuration Updated',
      `🏰 **Welcome Channel:** ${channel}\n👑 **Auto-Role:** ${role ? role : '*(None configured)*'}\n\nUse \`/test-welcome\` to simulate and preview the dynamic card!`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
