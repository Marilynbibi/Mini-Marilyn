import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const name = 'channelUpdate';

export async function execute(oldChannel, newChannel) {
  if (!newChannel.guild) return;
  if (oldChannel.name === newChannel.name) return;

  const guild = newChannel.guild;
  const config = getGuildConfig(guild.id);
  const stats = config.serverStats;

  if (!stats || !stats.enabled) return;

  let formatKey = null;
  let countType = null;

  if (newChannel.id === stats.allMembersChannelId) {
    formatKey = 'allMembersFormat';
    countType = 'all';
  } else if (newChannel.id === stats.membersChannelId) {
    formatKey = 'membersFormat';
    countType = 'members';
  } else if (newChannel.id === stats.botsChannelId) {
    formatKey = 'botsFormat';
    countType = 'bots';
  }

  if (!formatKey) return;

  // Calculate current counts
  const totalCount = guild.memberCount || guild.members.cache.size;
  const botCount = guild.members.cache.filter(m => m.user.bot).size;
  const humanCount = Math.max(0, totalCount - botCount);

  let currentCount = totalCount;
  if (countType === 'members') currentCount = humanCount;
  if (countType === 'bots') currentCount = botCount;

  const currentExpected = (stats[formatKey] || '').replace('{count}', currentCount.toString());

  // If this rename was performed by the bot itself, do not re-learn
  if (newChannel.name === currentExpected) {
    return;
  }

  // User/Admin customized the channel name!
  // Learn the new template from newChannel.name:
  let learnedFormat = newChannel.name;

  if (learnedFormat.includes('{count}')) {
    // User already explicitly typed {count}
  } else if (learnedFormat.includes(currentCount.toString())) {
    const countStr = currentCount.toString();
    const lastIdx = learnedFormat.lastIndexOf(countStr);
    learnedFormat = learnedFormat.slice(0, lastIdx) + '{count}' + learnedFormat.slice(lastIdx + countStr.length);
  } else if (/\d+/.test(learnedFormat)) {
    // Replace the last number group with {count}
    learnedFormat = learnedFormat.replace(/(\d+)(?!.*\d)/, '{count}');
  } else {
    // If user decorated with no numbers, append ' : {count}'
    learnedFormat = `${learnedFormat.trim()} : {count}`;
  }

  config.serverStats[formatKey] = learnedFormat;
  saveGuildConfig(guild.id, config);
  console.log(`[ServerStats] 🎨 Learned new custom format for ${formatKey} in "${guild.name}": "${learnedFormat}"`);
}
