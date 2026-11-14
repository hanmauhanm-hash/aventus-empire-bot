import { ActivityType } from 'discord.js';
import { CLAN } from '../config/constants.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Aventus Bot] Logged in successfully as ${client.user.tag}!`);
    console.log(`[Aventus Bot] Serving ${client.guilds.cache.size} guilds and ${client.users.cache.size} warriors.`);

    const activities = [
      { name: `Lifeboat Survival Mode`, type: ActivityType.Playing },
      { name: `over the Aventus Empire`, type: ActivityType.Watching },
      { name: `${CLAN.SERVER_IP}:${CLAN.SERVER_PORT}`, type: ActivityType.Competing },
      { name: `/help | Puter.js AI Core`, type: ActivityType.Listening }
    ];

    let current = 0;
    setInterval(() => {
      client.user.setPresence({
        activities: [activities[current]],
        status: 'online'
      });
      current = (current + 1) % activities.length;
    }, 15000);
  }
};
