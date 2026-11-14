import { SlashCommandBuilder } from 'discord.js';
import db from '../../config/database.js';
import { getUserProfile, addRewards } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily imperial salary and maintain your clan streak'),

  async execute(interaction) {
    const user = getUserProfile(interaction.user.id);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const timeSinceLast = now - (user.last_daily || 0);

    if (timeSinceLast < oneDay) {
      const remainingMs = oneDay - timeSinceLast;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

      const embed = AventusEmbed.error(
        'Daily Salary Already Claimed',
        `The Imperial Treasury has already disbursed your daily ration today!\nCome back in **${hours}h ${minutes}m** to claim your next salary.`
      );
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Check streak reset if overdue by more than 48h
    let newStreak = (user.daily_streak || 0) + 1;
    if (timeSinceLast > 48 * 60 * 60 * 1000) {
      newStreak = 1;
    }

    const baseReward = 500;
    const streakBonus = Math.min(newStreak * 50, 1000);
    const totalGold = baseReward + streakBonus;
    const totalXp = 50;

    db.prepare('UPDATE users SET daily_streak = ?, last_daily = ? WHERE user_id = ?').run(newStreak, now, interaction.user.id);
    const reward = addRewards(interaction.user.id, totalGold, totalXp);

    const embed = AventusEmbed.imperial(
      'Imperial Daily Salary Disbursed',
      `Hail warrior <@${interaction.user.id}>! Your service to the Aventus Empire has been compensated.\n\n` +
      `• ${EMOJIS.GOLD_INGOT} **Base Salary:** \`${baseReward} $EG\`\n` +
      `• 🔥 **Streak Bonus (${newStreak} Days):** \`+${streakBonus} $EG\`\n` +
      `• 💰 **Total Received:** \`+${totalGold} Empire Gold\`\n` +
      `• ✨ **XP Gained:** \`+${totalXp} XP\`\n\n` +
      `**Current Vault Balance:** \`${reward.newGold} $EG\``
    );

    await interaction.reply({ embeds: [embed] });
  }
};
