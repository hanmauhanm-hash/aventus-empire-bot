import { ActivityType, REST, Routes } from 'discord.js';
import { CLAN } from '../config/constants.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Aventus Bot] Logged in successfully as ${client.user.tag}!`);
    console.log(`[Aventus Bot] Serving ${client.guilds.cache.size} guilds and ${client.users.cache.size} warriors.`);

    // Automatically register and update slash commands with Discord REST API
    try {
      const rest = new REST({ version: '10' }).setToken(client.token);
      const commandData = [];

      for (const [name, command] of client.commands) {
        if (command?.data) {
          commandData.push(command.data.toJSON());
        }
      }

      console.log(`[Slash Commands] Auto-registering ${commandData.length} commands with Discord API...`);

      // 1. If GUILD_ID is provided in Railway variables, register instantly to that server
      if (process.env.GUILD_ID) {
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
          { body: commandData }
        );
        console.log(`[Slash Commands] Registered ${commandData.length} commands instantly to guild: ${process.env.GUILD_ID}`);
      }

      // 2. Register globally across all servers where the bot is invited
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commandData }
      );
      console.log(`[Slash Commands] Registered ${commandData.length} commands globally!`);
    } catch (err) {
      console.error('[Slash Commands Error] Failed to register slash commands:', err);
    }

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
