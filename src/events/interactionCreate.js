import db from '../config/database.js';
import { AventusEmbed } from '../utils/embedBuilder.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.warn(`[Command Warning] No handler for /${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`[Command Error /${interaction.commandName}]:`, error);
        const replyPayload = {
          embeds: [AventusEmbed.error('Imperial Execution Fault', `An unexpected error occurred while executing this command:\n\`${error.message}\``)],
          ephemeral: true
        };

        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(replyPayload).catch(() => {});
        } else {
          await interaction.reply(replyPayload).catch(() => {});
        }
      }
      return;
    }

    // 2. Handle Raid RSVP Buttons
    if (interaction.isButton() && interaction.customId.startsWith('raid_')) {
      const [action, roleType, raidId] = interaction.customId.split('_');
      const raid = db.prepare('SELECT * FROM raids WHERE id = ?').get(raidId);

      if (!raid) {
        return await interaction.reply({
          content: '⚠️ This raid event has expired or does not exist.',
          ephemeral: true
        });
      }

      let attendees = [];
      try {
        attendees = JSON.parse(raid.attendees_json || '[]');
      } catch (e) {
        attendees = [];
      }

      const userId = interaction.user.id;

      if (roleType === 'leave') {
        attendees = attendees.filter(id => id !== userId);
        db.prepare('UPDATE raids SET attendees_json = ? WHERE id = ?').run(JSON.stringify(attendees), raidId);
        return await interaction.reply({
          content: '🛡️ You have withdrawn from the raid roster.',
          ephemeral: true
        });
      } else {
        if (!attendees.includes(userId)) {
          attendees.push(userId);
          db.prepare('UPDATE raids SET attendees_json = ? WHERE id = ?').run(JSON.stringify(attendees), raidId);
          return await interaction.reply({
            content: `⚔️ You have enlisted for the **${raid.title}** raid as **${roleType === 'join' ? 'Vanguard' : 'Base Defense'}**!`,
            ephemeral: true
          });
        } else {
          return await interaction.reply({
            content: '⚔️ You are already enrolled on the raid roster!',
            ephemeral: true
          });
        }
      }
    }
  }
};
