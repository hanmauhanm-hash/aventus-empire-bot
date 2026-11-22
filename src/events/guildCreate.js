import { REST, Routes } from 'discord.js';

export default {
  name: 'guildCreate',
  async execute(guild, client) {
    console.log(`[Aventus Bot] Joined new guild: ${guild.name} (${guild.id})!`);
    try {
      const token = process.env.DISCORD_TOKEN || client.token;
      const rest = new REST({ version: '10' }).setToken(token);
      const commandData = [];

      for (const [name, command] of client.commands) {
        if (command?.data) {
          commandData.push(command.data.toJSON());
        }
      }

      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: commandData }
      );
      console.log(`[Slash Commands] Registered ${commandData.length} commands INSTANTLY to new guild ${guild.name}!`);
    } catch (err) {
      console.error(`[Slash Commands Error] Failed to register to new guild ${guild.id}:`, err);
    }
  }
};
