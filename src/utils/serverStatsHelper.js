import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from './storage.js';

/**
 * Updates the names of the server stats voice channels with realtime counts,
 * preserving any custom text, fonts, or emojis decorated by the server admins.
 * @param {import('discord.js').Guild} guild 
 */
export async function updateServerStats(guild) {
  if (!guild) return;
  const config = getGuildConfig(guild.id);
  const stats = config.serverStats;

  if (!stats || !stats.enabled) return;

  try {
    // Fetch members to ensure accurate cache
    await guild.members.fetch().catch(() => {});

    const totalCount = guild.memberCount || guild.members.cache.size;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = Math.max(0, totalCount - botCount);

    let configChanged = false;

    const checkAndSync = async (channelId, formatKey, count, defaultFormat) => {
      if (!channelId) return;
      const ch = guild.channels.cache.get(channelId);
      if (!ch) return;

      const countStr = count.toString();
      const currentFormat = stats[formatKey] || defaultFormat;
      const expectedName = currentFormat.replace('{count}', countStr);

      if (ch.name === expectedName) {
        return;
      }

      // If user customized/decorated channel name in Discord and it already has the current count,
      // learn the user's custom decoration instead of reverting it!
      if (ch.name.includes(countStr)) {
        const lastIdx = ch.name.lastIndexOf(countStr);
        const learned = ch.name.slice(0, lastIdx) + '{count}' + ch.name.slice(lastIdx + countStr.length);
        stats[formatKey] = learned;
        configChanged = true;
        console.log(`[ServerStats] Preserved & saved custom format for ${formatKey}: "${learned}"`);
        return;
      }

      // If count changed or needs update, set channel name using the current format
      await ch.setName(expectedName).catch(err => {
        console.warn(`[ServerStats] ${formatKey} rename error:`, err.message);
      });
    };

    await checkAndSync(stats.allMembersChannelId, 'allMembersFormat', totalCount, '🌸 All Members : {count}');
    await checkAndSync(stats.membersChannelId, 'membersFormat', humanCount, '🍥 Members : {count}');
    await checkAndSync(stats.botsChannelId, 'botsFormat', botCount, '👘 Bots : {count}');

    if (configChanged) {
      saveGuildConfig(guild.id, config);
    }
  } catch (error) {
    console.error(`[ServerStats] Failed to update stats for guild "${guild.name}":`, error.message);
  }
}
