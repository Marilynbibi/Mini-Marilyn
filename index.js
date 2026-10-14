import { Client, GatewayIntentBits, Collection, REST, Routes, Partials } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || token === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
  console.log('\n======================================================');
  console.error('❌ [ข้อผิดพลาด]: ยังไม่ได้ใส่ DISCORD_TOKEN ในไฟล์ .env');
  console.log('======================================================\n');
  process.exit(1);
}

// Global Crash Prevention Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Anti-Crash] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('⚠️ [Anti-Crash] Uncaught Exception:', err, 'origin:', origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.error('⚠️ [Anti-Crash] Uncaught Exception Monitor:', err, 'origin:', origin);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ],
  partials: [
    Partials.User,
    Partials.GuildMember,
    Partials.Channel,
    Partials.Message
  ]
});

client.on('error', (err) => {
  console.error('⚠️ [Discord Client Error]:', err.message);
});

client.commands = new Collection();
const slashCommandsJSON = [];

// 1. Load Commands
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    slashCommandsJSON.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute" property.`);
  }
}

// 2. Load Events
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = await import(`file://${filePath}`);
  const eventName = event.name === 'ready' ? 'clientReady' : event.name;
  if (event.once) {
    client.once(eventName, (...args) => event.execute(...args));
  } else {
    client.on(eventName, (...args) => event.execute(...args));
  }
}

// 3. Register Slash Commands (Both Guild-Instant & Global)
async function registerSlashCommands(appId) {
  const rest = new REST().setToken(token);
  try {
    console.log(`🔄 กำลังอัปเดต (${slashCommandsJSON.length}) Slash Commands ไปยังทุกเซิร์ฟเวอร์แบบ Real-time...`);
    
    // Deploy to each connected guild for INSTANT realtime update
    for (const guild of client.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(appId, guild.id),
        { body: slashCommandsJSON }
      );
      console.log(`⚡ อัปเดต Slash Commands ให้เซิร์ฟเวอร์ "${guild.name}" (${guild.id}) สำเร็จทันที!`);
    }

    // Also register global commands
    await rest.put(
      Routes.applicationCommands(appId),
      { body: slashCommandsJSON }
    );
    console.log(`✅ ลงทะเบียน Global Slash Commands สำเร็จเรียบร้อย!`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการลงทะเบียน Slash Commands:', error);
  }
}

client.once('clientReady', async (readyClient) => {
  await registerSlashCommands(clientId || readyClient.user.id);
});

// Login
client.login(token).catch(err => {
  console.error('❌ เข้าสู่ระบบ Discord ไม่สำเร็จ:', err.message);
});
