import { askAdvisor } from '../services/puterService.js';
import { AventusEmbed } from '../utils/embedBuilder.js';
import { executeHunt, getUserZoo, simulateBattle, getUserProfile, addRewards } from '../services/owoService.js';
import { queryBedrockServer } from '../services/clanService.js';
import { CLAN, EMOJIS, OWO_RARITIES } from '../config/constants.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    // 1. Direct AI @Mention handling
    const isMentioned = message.mentions.has(client.user.id) && !message.mentions.everyone;
    if (isMentioned) {
      const cleanPrompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();

      if (!cleanPrompt) {
        return message.reply(`👑 Hail <@${message.author.id}>! Ask me any strategic question regarding Lifeboat Survival tactics, Bedrock PvP, base defense, or pack conversions.`);
      }

      try {
        await message.channel.sendTyping();
        const response = await askAdvisor(cleanPrompt);
        const embed = AventusEmbed.ai('Imperial Advisor Response', response);
        return await message.reply({ embeds: [embed] });
      } catch (err) {
        console.error('[Puter Mention Error]:', err);
        return await message.reply('⚠️ Failed to contact imperial intelligence. Please check `/ask` or try again shortly.');
      }
    }

    // 2. Prefix command support (!help, !hunt, !daily, !zoo, !battle, !lbsg, !ping)
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // !ping
    if (commandName === 'ping') {
      const sent = await message.reply('⚔️ Measuring imperial heartbeat...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      const embed = AventusEmbed.imperial(
        'Imperial Vanguard Latency',
        `${EMOJIS.SWORD} **Gateway Latency:** \`${latency}ms\`\n${EMOJIS.FIRE} **WebSocket Heartbeat:** \`${client.ws.ping}ms\``
      );
      return await sent.edit({ content: null, embeds: [embed] });
    }

    // !help
    if (commandName === 'help') {
      const embed = AventusEmbed.imperial(
        `${CLAN.NAME} — Command Codex`,
        `Welcome to the command hub for the **${CLAN.NAME}** on Lifeboat Survival Mode (Bedrock).\nAll features are accessible via both **Slash Commands (/)** and **Prefix (!)**.`
      )
      .addFields(
        {
          name: `${EMOJIS.SWORD} OwO-Style RPG & Mini-Game`,
          value: '`!hunt`, `!zoo`, `!battle`, `!daily`, `!coinflip <amount> <heads/tails>`, `!leaderboard`'
        },
        {
          name: `${EMOJIS.AI_SPARKLE} Puter.js AI Imperial Advisor`,
          value: '`!ask <question>` or `@AventusBot <question>`'
        },
        {
          name: `${EMOJIS.CONVERT} Java to Bedrock Converter & Recolor`,
          value: 'Use slash commands `/convert` and `/recolor` to upload texture packs & skins.'
        },
        {
          name: `${EMOJIS.SHIELD} Clan & Lifeboat Tools`,
          value: '`!lbsg` (Server Pulse), `/coords` (Secret Waypoints), `/raid` (Raid Organizer)'
        }
      );
      return await message.reply({ embeds: [embed] });
    }

    // !hunt
    if (commandName === 'hunt') {
      const result = executeHunt(message.author.id);
      const { beast, goldEarned, xpEarned, rewardResult } = result;
      const rarityConfig = OWO_RARITIES[beast.rarity];

      const embed = AventusEmbed.owo(
        'Wilderness Expedition — Beast Captured!',
        `<@${message.author.id}> ventured into the wild lands of Lifeboat Survival...\n\n` +
        `### ${beast.emoji} **${beast.name}**\n` +
        `• **Rarity:** \`${rarityConfig.name}\`\n` +
        `• **Combat Power:** \`${beast.power} ATK\` | \`${beast.hp} HP\`\n\n` +
        `**Rewards Gained:**\n` +
        `• ${EMOJIS.COIN} **+${goldEarned}** Empire Gold (Balance: \`${rewardResult.newGold} $EG\`)\n` +
        `• ✨ **+${xpEarned}** XP (Level: \`${rewardResult.newLevel}\`)${rewardResult.leveledUp ? '\n🎉 **LEVEL UP!** You reached a new clan rank!' : ''}`
      );
      return await message.reply({ embeds: [embed] });
    }

    // !zoo
    if (commandName === 'zoo') {
      const target = message.mentions.users.first() || message.author;
      const zoo = getUserZoo(target.id);
      const profile = getUserProfile(target.id);

      if (zoo.length === 0) {
        return await message.reply({
          embeds: [AventusEmbed.owo(`${target.username}'s Imperial Zoo`, `${target.username} has no beasts yet! Use \`!hunt\` to capture beasts.`)]
        });
      }

      const totalBeasts = zoo.reduce((acc, b) => acc + b.count, 0);
      const totalPower = zoo.reduce((acc, b) => acc + b.attack * b.count, 0);

      const beastList = zoo.map(b => `• **${b.name}** [x${b.count}] — \`${b.rarity}\` | ⚔️ \`${b.attack} ATK\` | ❤️ \`${b.hp} HP\``).slice(0, 15).join('\n');

      const embed = AventusEmbed.owo(
        `${EMOJIS.CROWN} ${target.username}'s Imperial Menagerie`,
        `**Clan Rank Level:** \`${profile.level}\` | **Total Hunts:** \`${profile.hunt_count}\`\n` +
        `**Total Beasts:** \`${totalBeasts}\` | **Squad Combat Power:** \`${totalPower}\`\n\n` +
        `### Captured Beasts:\n${beastList}`
      );
      return await message.reply({ embeds: [embed] });
    }

    // !daily
    if (commandName === 'daily') {
      const user = getUserProfile(message.author.id);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const timeSinceLast = now - (user.last_daily || 0);

      if (timeSinceLast < oneDay) {
        const remainingMs = oneDay - timeSinceLast;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        return await message.reply({
          embeds: [AventusEmbed.error('Daily Salary Already Claimed', `The Imperial Treasury already paid you today! Return in **${hours}h ${minutes}m**.`)]
        });
      }

      let newStreak = (user.daily_streak || 0) + 1;
      if (timeSinceLast > 48 * 60 * 60 * 1000) newStreak = 1;

      const baseReward = 500;
      const streakBonus = Math.min(newStreak * 50, 1000);
      const totalGold = baseReward + streakBonus;

      import('../config/database.js').then(({ default: db }) => {
        db.prepare('UPDATE users SET daily_streak = ?, last_daily = ? WHERE user_id = ?').run(newStreak, now, message.author.id);
        const reward = addRewards(message.author.id, totalGold, 50);

        const embed = AventusEmbed.imperial(
          'Imperial Daily Salary Disbursed',
          `Hail <@${message.author.id}>! Your salary has been processed:\n\n` +
          `• 🪙 **Received:** \`+${totalGold} Empire Gold\` (Streak: ${newStreak} Days)\n` +
          `• 💰 **Vault Balance:** \`${reward.newGold} $EG\``
        );
        message.reply({ embeds: [embed] });
      });
      return;
    }

    // !battle
    if (commandName === 'battle') {
      const result = simulateBattle(message.author.id, 'Lifeboat Void Destroyer');
      if (result.error) {
        return await message.reply({ embeds: [AventusEmbed.error('Battle Squad Missing', result.error)] });
      }

      const { victory, team, rounds, logs, goldReward, xpReward } = result;
      const logSummary = logs.slice(0, 5).join('\n');

      const embed = victory
        ? AventusEmbed.success(
            'VICTORY! Lifeboat Void Destroyer Defeated!',
            `⚔️ **Squad:** ${team.map(t => t.name).join(', ')}\n` +
            `🛡️ **Rounds:** ${rounds}\n\n` +
            `### Battle Log:\n${logSummary}\n\n` +
            `• 🪙 **+${goldReward}** Empire Gold | ✨ **+${xpReward}** Clan XP`
          )
        : AventusEmbed.error(
            'DEFEAT! Your Squad Retreated',
            `### Battle Log:\n${logSummary}\n\n*Earned +${xpReward} XP for battle resilience.*`
          );

      return await message.reply({ embeds: [embed] });
    }

    // !lbsg
    if (commandName === 'lbsg') {
      await message.channel.sendTyping();
      const data = await queryBedrockServer(CLAN.SERVER_IP, CLAN.SERVER_PORT);

      if (!data.online) {
        return await message.reply({
          embeds: [AventusEmbed.error('Server Unreachable', `Unable to ping ${CLAN.SERVER_IP}:${CLAN.SERVER_PORT}`)]
        });
      }

      const embed = AventusEmbed.imperial(
        `${CLAN.NAME} — Lifeboat Server Pulse`,
        `📡 **Status:** \`ONLINE\` ✅\n` +
        `🌐 **Server IP:** \`${data.ip}:${data.port}\`\n` +
        `🎮 **Version:** \`${data.version}\`\n` +
        `👥 **Warriors Online:** \`${data.players.online} / ${data.players.max}\`\n\n` +
        `### MOTD:\n\`\`\`\n${data.motd}\n\`\`\``
      );
      return await message.reply({ embeds: [embed] });
    }

    // !ask
    if (commandName === 'ask') {
      const query = args.join(' ');
      if (!query) return message.reply('👑 Please specify your tactical question (e.g. `!ask how to defend a clan base on lifeboat`).');

      await message.channel.sendTyping();
      const response = await askAdvisor(query);
      return await message.reply({ embeds: [AventusEmbed.ai('Imperial Advisor Response', response)] });
    }
  }
};
