import { SlashCommandBuilder } from 'discord.js';
import { data as originalData, execute as originalExecute } from './setgamerole.js';

export const data = new SlashCommandBuilder()
  .setName('gamepanel')
  .setDescription(originalData.description);

// Copy all options and permissions from setgamerole
data.setDefaultMemberPermissions(originalData.default_member_permissions);
originalData.options.forEach(opt => data.options.push(opt));

export async function execute(interaction) {
  return originalExecute(interaction);
}
