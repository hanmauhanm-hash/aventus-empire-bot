import { askAdvisor } from '../services/puterService.js';
import { AventusEmbed } from '../utils/embedBuilder.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    // Check if the bot was directly mentioned
    const isMentioned = message.mentions.has(client.user.id) && !message.mentions.everyone;

    if (isMentioned) {
      const cleanPrompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();

      if (!cleanPrompt) {
        return message.reply('👑 Hail warrior! Ask me any question regarding Lifeboat Survival tactics, Bedrock PvP, base defense, or pack conversions.');
      }

      try {
        await message.channel.sendTyping();
        const response = await askAdvisor(cleanPrompt);

        const embed = AventusEmbed.ai(
          'Imperial Advisor Response',
          response
        );

        await message.reply({ embeds: [embed] });
      } catch (err) {
        console.error('[Puter Mention Error]:', err);
        await message.reply('⚠️ Failed to contact imperial intelligence. Please check `/ask` or try again shortly.');
      }
    }
  }
};
