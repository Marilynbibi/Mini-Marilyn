import { SlashCommandBuilder } from 'discord.js';
import { data as originalData, execute as originalExecute } from './selfroles.js';

export const data = new SlashCommandBuilder()
  .setName('setroles')
  .setDescription(originalData.description);

data.setDefaultMemberPermissions(originalData.default_member_permissions);
originalData.options.forEach(opt => data.options.push(opt));

export async function execute(interaction) {
  return originalExecute(interaction);
}
