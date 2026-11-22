import { ActivityType, REST, Routes } from 'discord.js';
import { CLAN } from '../config/constants.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Aventus Bot] Logged in successfully as ${client.user.tag}!`);
    console.log(`[Aventus Bot] Serving ${client.guilds.cache.size} guilds and ${client.users.cache.size} warriors.`);

    const registerCommands = async () => {
      try {
        const token = process.env.DISCORD_TOKEN || client.token;
        const rest = new REST({ version: '10' }).setToken(token);
        const commandData = [];

        for (const [name, command] of client.commands) {
          if (command?.data) {
            commandData.push(command.data.toJSON());
          }
        }

        console.log(`[Slash Commands] Registering ${commandData.length} commands across guilds...`);

        // 1. Register to EVERY guild the bot is in for INSTANT (0-second) availability!
        for (const [guildId, guild] of client.guilds.cache) {
          try {
            await rest.put(
              Routes.applicationGuildCommands(client.user.id, guildId),
              { body: commandData }
            );
            console.log(`[Slash Commands] Registered ${commandData.length} commands INSTANTLY to ${guild.name} (${guildId})`);
          } catch (gErr) {
            console.warn(`[Slash Commands Warning] Could not register to guild ${guildId}:`, gErr.message);
          }
        }

        // 2. Also register globally
        await rest.put(
          Routes.applicationCommands(client.user.id),
          { body: commandData }
        );
        console.log(`[Slash Commands] Registered ${commandData.length} commands globally!`);
      } catch (err) {
        console.error('[Slash Commands Error] Registration failed:', err);
      }
    };

    // Run registration immediately and retry 5s later to catch any delayed guild cache
    await registerCommands();
    setTimeout(registerCommands, 5000);

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
