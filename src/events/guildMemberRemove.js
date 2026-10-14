import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../utils/storage.js';
import { updateServerStats } from '../utils/serverStatsHelper.js';

export const name = 'guildMemberRemove';

export async function execute(member) {
  const guild = member.guild;
  const config = getGuildConfig(guild.id);

  console.log(`📤 [Member Left] ${member.user.tag} left "${guild.name}" (${guild.id})`);

  // 1. GOODBYE MESSAGE & EMBED
  if (config.goodbye?.enabled && config.goodbye?.channelId) {
    try {
      const channel = guild.channels.cache.get(config.goodbye.channelId);
      if (channel && channel.isTextBased()) {
        const rawMessage = config.goodbye.message || "ลาก่อนนะคะคุณ **{user}** หวังว่าเราจะได้พบกันใหม่อีกครั้งที่ **{server}** นะคะ 🥺👋\nตอนนี้เหลือสมาชิก **{count}** คน";
        const formattedMessage = rawMessage
          .replace(/{user}/g, member.displayName || member.user.username)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, guild.name)
          .replace(/{count}/g, guild.memberCount.toString());

        const embed = new EmbedBuilder()
          .setColor(config.goodbye.embedColor || '#FFA07A')
          .setAuthor({
            name: `👋 มีสมาชิกออกจาก ${guild.name}`,
            iconURL: guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL({ dynamic: true })
          })
          .setTitle(`🥺 บ๊ายบายคุณ ${member.displayName || member.user.username}...`)
          .setDescription(formattedMessage)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .addFields(
            { name: '👤 บัญชี Discord', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
            { name: '👥 สมาชิกที่เหลืออยู่', value: `${guild.memberCount} คน`, inline: true }
          )
          .setImage(config.goodbye?.gifUrl || 'https://media.giphy.com/media/efgV24BqJ0uQz555eG/giphy.gif')
          .setFooter({ text: `mini marilyn • Goodbye System • ${guild.name}`, iconURL: member.client.user.displayAvatarURL() })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log(`👋 [Goodbye] Sent goodbye message for ${member.user.tag} to channel #${channel.name} in ${guild.name}`);
      }
    } catch (error) {
      console.error(`⚠️ [Goodbye Error] Failed to send goodbye message in ${guild.name}:`, error.message);
    }
  }

  // 2. REALTIME SERVER STATS UPDATE
  updateServerStats(guild).catch(() => {});
}

