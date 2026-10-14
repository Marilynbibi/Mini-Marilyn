import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../utils/storage.js';
import { updateServerStats } from '../utils/serverStatsHelper.js';

export const name = 'guildMemberAdd';

export async function execute(member) {
  const guild = member.guild;
  const config = getGuildConfig(guild.id);

  console.log(`📥 [Member Joined] ${member.user.tag} entered "${guild.name}" (${guild.id})`);

  // 1. AUTO-ROLE ASSIGNMENT
  if (config.autoRole?.enabled && Array.isArray(config.autoRole?.roleIds) && config.autoRole.roleIds.length > 0) {
    for (const roleId of config.autoRole.roleIds) {
      try {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role);
          console.log(`🛡️ [AutoRole] Assigned role "${role.name}" to ${member.user.tag} in ${guild.name}`);
        }
      } catch (error) {
        console.error(`⚠️ [AutoRole Error] Failed to assign role ${roleId} in ${guild.name}:`, error.message);
      }
    }
  }

  // 2. WELCOME MESSAGE & EMBED
  if (config.welcome?.enabled && config.welcome?.channelId) {
    try {
      const channel = guild.channels.cache.get(config.welcome.channelId);
      if (channel && channel.isTextBased()) {
        const rawMessage = config.welcome.message || "ยินดีต้อนรับคุณ {user} เข้าสู่เซิร์ฟเวอร์ **{server}**! 🎉\nคุณคือสมาชิกคนที่ **{count}** ของเรา 🐶✨";
        const formattedMessage = rawMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, guild.name)
          .replace(/{count}/g, guild.memberCount.toString());

        const embed = new EmbedBuilder()
          .setColor(config.welcome.embedColor || '#FFB6C1')
          .setAuthor({
            name: `👋 ยินดีต้อนรับสมาชิกใหม่สู่ ${guild.name}!`,
            iconURL: guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL({ dynamic: true })
          })
          .setTitle(`🎉 ยินดีต้อนรับคุณ ${member.displayName || member.user.username}!`)
          .setDescription(formattedMessage)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .addFields(
            { name: '👤 บัญชี Discord', value: `<@${member.id}> (${member.user.tag})`, inline: true },
            { name: '🐶 สมาชิกลำดับที่', value: `#${guild.memberCount}`, inline: true },
            { name: '📅 วันที่สร้างบัญชี', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
          )
          .setImage(config.welcome?.gifUrl || 'https://media.giphy.com/media/l4pT7ZzGjG0jZ9Vvy/giphy.gif')
          .setFooter({ text: `mini marilyn • Welcome System • ${guild.name}`, iconURL: member.client.user.displayAvatarURL() })
          .setTimestamp();

        await channel.send({
          content: `ยินดีต้อนรับ <@${member.id}> นะคะ! 💕`,
          embeds: [embed]
        });
        console.log(`👋 [Welcome] Sent welcome message for ${member.user.tag} to channel #${channel.name} in ${guild.name}`);
      }
    } catch (error) {
      console.error(`⚠️ [Welcome Error] Failed to send welcome message in ${guild.name}:`, error.message);
    }
  }

  // 3. REALTIME SERVER STATS UPDATE
  updateServerStats(guild).catch(() => {});
}
