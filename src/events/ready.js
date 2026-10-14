import { ActivityType } from 'discord.js';
import { loadAllConfig } from '../utils/storage.js';
import { updateServerStats } from '../utils/serverStatsHelper.js';

export const name = 'ready';
export const once = true;

export async function execute(client) {
  console.log(`========================================`);
  console.log(`🎉 mini marilyn is now ONLINE!`);
  console.log(`🤖 Logged in as: ${client.user.tag} (${client.user.id})`);
  console.log(`🐶 Connected to ${client.guilds.cache.size} server(s)`);
  client.guilds.cache.forEach(g => console.log(`   - ${g.name} (ID: ${g.id}) | Members: ${g.memberCount}`));
  console.log(`========================================`);

  const all = loadAllConfig();
  const customStatus = all.botStatus?.text || '⋆. 🎀 Marilyn 𝝑𝝔 | /help ˚⋆';
  const statusTypeStr = all.botStatus?.type || 'Custom';

  let activityType = ActivityType.Custom;
  if (statusTypeStr === 'Playing') activityType = ActivityType.Playing;
  else if (statusTypeStr === 'Watching') activityType = ActivityType.Watching;
  else if (statusTypeStr === 'Listening') activityType = ActivityType.Listening;
  else if (statusTypeStr === 'Competing') activityType = ActivityType.Competing;

  // Set rich custom activity status
  client.user.setPresence({
    activities: [
      {
        name: customStatus,
        type: activityType
      }
    ],
    status: 'online'
  });

  // Initial Server Stats sync on boot
  for (const guild of client.guilds.cache.values()) {
    updateServerStats(guild).catch(() => {});
  }

  // Periodic Server Stats sync every 10 minutes
  setInterval(() => {
    for (const guild of client.guilds.cache.values()) {
      updateServerStats(guild).catch(() => {});
    }
  }, 10 * 60 * 1000);
}

