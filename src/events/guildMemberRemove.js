import { AttachmentBuilder } from 'discord.js';
import db from '../config/database.js';
import { generateLeaveCard } from '../services/canvasService.js';
import { AventusEmbed } from '../utils/embedBuilder.js';
import { CLAN } from '../config/constants.js';

export default {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      const settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(member.guild.id);
      if (!settings?.leave_channel_id) return;

      const channel = member.guild.channels.cache.get(settings.leave_channel_id);
      if (!channel) return;

      const cardBuffer = await generateLeaveCard(member);
      const fileAttachment = new AttachmentBuilder(cardBuffer, { name: 'aventus_leave.png' });

      const embed = AventusEmbed.imperial(
        'Warrior Departed the Stronghold',
        `**${member.user.tag}** has severed ties with the **${CLAN.NAME}**.\n` +
        `The empire now stands with **${member.guild.memberCount}** surviving members.`
      )
      .setImage('attachment://aventus_leave.png');

      await channel.send({
        embeds: [embed],
        files: [fileAttachment]
      });
    } catch (err) {
      console.error('[guildMemberRemove Error]:', err);
    }
  }
};
