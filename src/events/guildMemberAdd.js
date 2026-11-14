import { AttachmentBuilder } from 'discord.js';
import db from '../config/database.js';
import { generateWelcomeCard } from '../services/canvasService.js';
import { AventusEmbed } from '../utils/embedBuilder.js';
import { CLAN, EMOJIS } from '../config/constants.js';

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      // 1. Fetch guild welcome settings from SQLite
      const settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(member.guild.id);

      // Auto-role assignment if configured
      if (settings?.autorole_id) {
        try {
          const role = member.guild.roles.cache.get(settings.autorole_id);
          if (role) {
            await member.roles.add(role);
          }
        } catch (roleErr) {
          console.warn(`[AutoRole] Failed to assign role to ${member.user.tag}:`, roleErr.message);
        }
      }

      if (!settings?.welcome_channel_id) return;

      const channel = member.guild.channels.cache.get(settings.welcome_channel_id);
      if (!channel) return;

      // 2. Generate dynamic welcome card
      const cardBuffer = await generateWelcomeCard(member);
      const fileAttachment = new AttachmentBuilder(cardBuffer, { name: 'aventus_welcome.png' });

      // 3. Compose Imperial Welcome Embed
      const embed = AventusEmbed.imperial(
        `Welcome to the ${CLAN.NAME}!`,
        `${EMOJIS.CROWN} Hail <@${member.user.id}>! You have stepped into the stronghold of the **${CLAN.NAME}** on Lifeboat Survival Mode.\n\n` +
        `• **Server Address:** \`${CLAN.SERVER_IP}:${CLAN.SERVER_PORT}\`\n` +
        `• **Clan Rank:** \`Recruit (Tier I)\`\n` +
        `• **Motto:** *"${CLAN.MOTTO}"*\n\n` +
        `*Gear up, check your coordinates, and prepare for glory!*`
      )
      .setImage('attachment://aventus_welcome.png');

      await channel.send({
        content: `⚔️ Welcome to the empire, <@${member.user.id}>!`,
        embeds: [embed],
        files: [fileAttachment]
      });
    } catch (err) {
      console.error('[guildMemberAdd Error]:', err);
    }
  }
};
