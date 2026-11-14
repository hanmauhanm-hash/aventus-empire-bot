import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

client.commands = new Collection();

// 1. Load Commands recursively
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    try {
      const command = (await import(pathToFileURL(filePath).href)).default;
      if (command?.data?.name) {
        client.commands.set(command.data.name, command);
        console.log(`[Loader] Loaded command: /${command.data.name} (${folder})`);
      }
    } catch (err) {
      console.error(`[Loader] Failed to load command ${file}:`, err);
    }
  }
}

// 2. Load Events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const filePath = path.join(__dirname, 'events', file);
  try {
    const event = (await import(pathToFileURL(filePath).href)).default;
    if (event?.name) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      console.log(`[Loader] Loaded event: ${event.name}`);
    }
  } catch (err) {
    console.error(`[Loader] Failed to load event ${file}:`, err);
  }
}

// 3. Global Exception Handlers to keep the bot alive 24/7
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Anti-Crash] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('[Anti-Crash] Uncaught Exception:', err, 'origin:', origin);
});

// 4. Login
if (!process.env.DISCORD_TOKEN) {
  console.error('[Fatal Error] DISCORD_TOKEN is missing in .env file!');
  console.log('Please copy .env.example to .env and configure your bot credentials.');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
