import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import db from '../../config/database.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS, CLAN } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Organize a clan raid or defense expedition for Lifeboat Survival')
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Objective of the raid (e.g. Rival Clan Base Siege, Wither Hunt)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('time')
        .setDescription('Target time or countdown (e.g. Tonight at 8 PM EST)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('gear')
        .setDescription('Required equipment (e.g. Protection IV Diamond, Potions, Totems)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const timeStr = interaction.options.getString('time');
    const gear = interaction.options.getString('gear') || 'Full Diamond / Netherite Gear, Totems, Potions';

    const insert = db.prepare(`
      INSERT INTO raids (guild_id, creator_id, title, description, target_time, attendees_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(interaction.guildId, interaction.user.id, title, gear, timeStr, JSON.stringify([interaction.user.id]));

    const raidId = insert.lastInsertRowid;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`raid_join_${raidId}`)
        .setLabel('⚔️ Join Vanguard')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`raid_defend_${raidId}`)
        .setLabel('🛡️ Base Defense')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`raid_leave_${raidId}`)
        .setLabel('❌ Withdraw')
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = AventusEmbed.imperial(
      `WAR ROOM: ${title.toUpperCase()}`,
      `👑 **Raid Commander:** <@${interaction.user.id}>\n` +
      `⏱️ **Target Deployment:** \`${timeStr}\`\n` +
      `🎒 **Required Equipment:** \`${gear}\`\n\n` +
      `### ⚔️ Confirmed Vanguard [1]:\n• <@${interaction.user.id}> *(Commander)*\n\n` +
      `*Click the buttons below to pledge your sword to the Aventus Empire!*`
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
