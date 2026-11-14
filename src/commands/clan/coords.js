import { SlashCommandBuilder } from 'discord.js';
import { addWaypoint, getWaypoints, deleteWaypoint, convertDimensionCoords } from '../../services/clanService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coords')
    .setDescription('Manage secret waypoints, clan bases, and Nether coordinate calculations')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Save a new waypoint or base coordinate')
        .addStringOption(opt => opt.setName('name').setDescription('Name of waypoint (e.g. Clan Vault, Spawner)').setRequired(true))
        .addIntegerOption(opt => opt.setName('x').setDescription('X Coordinate').setRequired(true))
        .addIntegerOption(opt => opt.setName('y').setDescription('Y Coordinate (Height)').setRequired(true))
        .addIntegerOption(opt => opt.setName('z').setDescription('Z Coordinate').setRequired(true))
        .addStringOption(opt =>
          opt.setName('dimension')
            .setDescription('World Dimension')
            .setRequired(false)
            .addChoices(
              { name: 'Overworld', value: 'Overworld' },
              { name: 'Nether', value: 'Nether' },
              { name: 'The End', value: 'The End' }
            )
        )
        .addBooleanOption(opt => opt.setName('clan_share').setDescription('Make visible to all clan members in this Discord?').setRequired(false))
        .addStringOption(opt => opt.setName('note').setDescription('Secret security note or warning').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View your private and shared clan coordinates')
    )
    .addSubcommand(sub =>
      sub.setName('nether')
        .setDescription('Calculate Nether-to-Overworld 8:1 portal linkage math')
        .addIntegerOption(opt => opt.setName('x').setDescription('X coordinate').setRequired(true))
        .addIntegerOption(opt => opt.setName('y').setDescription('Y coordinate').setRequired(true))
        .addIntegerOption(opt => opt.setName('z').setDescription('Z coordinate').setRequired(true))
        .addStringOption(opt =>
          opt.setName('from')
            .setDescription('Current dimension you are converting FROM')
            .setRequired(true)
            .addChoices(
              { name: 'Overworld -> Nether (Divide by 8)', value: 'Overworld' },
              { name: 'Nether -> Overworld (Multiply by 8)', value: 'Nether' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Delete a waypoint by ID')
        .addIntegerOption(opt => opt.setName('id').setDescription('Waypoint ID from /coords list').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const name = interaction.options.getString('name');
      const x = interaction.options.getInteger('x');
      const y = interaction.options.getInteger('y');
      const z = interaction.options.getInteger('z');
      const dimension = interaction.options.getString('dimension') || 'Overworld';
      const isClan = interaction.options.getBoolean('clan_share') || false;
      const note = interaction.options.getString('note') || '';

      const id = addWaypoint({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        name,
        x,
        y,
        z,
        dimension,
        isClan,
        note
      });

      const embed = AventusEmbed.success(
        'Waypoint Registered in Imperial Vault',
        `📍 **Waypoint #${id}:** \`${name}\`\n` +
        `• **Coordinates:** \`X: ${x} | Y: ${y} | Z: ${z}\` (${dimension})\n` +
        `• **Visibility:** ${isClan ? '🛡️ **Shared with Clan**' : '🔒 **Personal (Only You)**'}\n` +
        (note ? `• **Security Note:** *${note}*\n` : '')
      );

      await interaction.reply({ embeds: [embed], ephemeral: !isClan });
    } else if (sub === 'list') {
      const waypoints = getWaypoints(interaction.guildId, interaction.user.id);

      if (waypoints.length === 0) {
        return await interaction.reply({
          embeds: [AventusEmbed.imperial('Imperial Waypoints Vault', 'No coordinates have been recorded yet.\nUse `/coords add` to store your bases, spawners, and portals.')],
          ephemeral: true
        });
      }

      const rows = waypoints.map(wp => {
        const badge = wp.is_clan ? '🛡️ **[CLAN]**' : '🔒 **[PRIVATE]**';
        return `• **#${wp.id}** ${badge} **${wp.name}**\n  ↳ \`X: ${wp.x}, Y: ${wp.y}, Z: ${wp.z}\` (${wp.dimension}) ${wp.note ? `— *${wp.note}*` : ''}`;
      }).join('\n\n');

      const embed = AventusEmbed.imperial(
        'Imperial Coordinates & Waypoint Archive',
        rows
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (sub === 'nether') {
      const x = interaction.options.getInteger('x');
      const y = interaction.options.getInteger('y');
      const z = interaction.options.getInteger('z');
      const fromDim = interaction.options.getString('from');

      const converted = convertDimensionCoords(x, y, z, fromDim);

      const embed = AventusEmbed.imperial(
        'Nether Portal Linkage Calculation',
        `Converting coordinates from **${fromDim}** to **${converted.dimension}**:\n\n` +
        `• **Input:** \`X: ${x} | Y: ${y} | Z: ${z}\` (${fromDim})\n` +
        `• 🌀 **Target Link Portal:** \`X: ${converted.x} | Y: ${converted.y} | Z: ${converted.z}\` (${converted.dimension})\n\n` +
        `💡 *Building a portal at these exact target coordinates guarantees seamless 1:1 portal linkage without cross-spawning!*`
      );

      await interaction.reply({ embeds: [embed] });
    } else if (sub === 'delete') {
      const id = interaction.options.getInteger('id');
      const result = deleteWaypoint(id, interaction.user.id);

      if (!result.success) {
        return await interaction.reply({
          embeds: [AventusEmbed.error('Deletion Failed', result.error)],
          ephemeral: true
        });
      }

      await interaction.reply({
        embeds: [AventusEmbed.success('Waypoint Deleted', `Waypoint **#${id}** has been removed from the archives.`)],
        ephemeral: true
      });
    }
  }
};
