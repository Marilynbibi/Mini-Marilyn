import { REST, Routes } from 'discord.js';

export const name = 'guildCreate';

export async function execute(guild) {
  console.log(`🎉 [New Server] mini marilyn has joined "${guild.name}" (ID: ${guild.id})!`);

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID || guild.client.user.id;

  if (token && clientId) {
    try {
      const rest = new REST().setToken(token);
      const commands = Array.from(guild.client.commands.values()).map(cmd => cmd.data.toJSON());

      await rest.put(
        Routes.applicationGuildCommands(clientId, guild.id),
        { body: commands }
      );
      console.log(`⚡ [Slash Commands] Successfully synced ${commands.length} commands to "${guild.name}"!`);
    } catch (error) {
      console.error(`❌ Failed to sync slash commands to "${guild.name}":`, error);
    }
  }
}
