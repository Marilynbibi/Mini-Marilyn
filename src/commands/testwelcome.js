import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('testwelcome')
  .setDescription('ทดสอบการแสดงผลการ์ดต้อนรับสมาชิกใหม่ (Welcome Card Preview)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const config = getGuildConfig(interaction.guildId);
  const user = interaction.user;
  const guild = interaction.guild;

  const rawMessage = config.welcome?.message || "ยินดีต้อนรับคุณ {user} เข้าสู่เซิร์ฟเวอร์ **{server}**! 🎉\nคุณคือสมาชิกคนที่ **{count}** ของเรา 🐶✨";
  const formattedMessage = rawMessage
    .replace(/{user}/g, `<@${user.id}>`)
    .replace(/{username}/g, user.username)
    .replace(/{server}/g, guild.name)
    .replace(/{count}/g, guild.memberCount.toString());

  const embed = new EmbedBuilder()
    .setColor(config.welcome?.embedColor || '#FFB6C1')
    .setAuthor({
      name: `👋 ยินดีต้อนรับสมาชิกใหม่สู่ ${guild.name}!`,
      iconURL: guild.iconURL({ dynamic: true }) || user.displayAvatarURL({ dynamic: true })
    })
    .setTitle(`🎉 ยินดีต้อนรับคุณ ${user.displayName || user.username}!`)
    .setDescription(formattedMessage)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: '👤 บัญชี Discord', value: `<@${user.id}> (${user.tag})`, inline: true },
      { name: '🐶 สมาชิกลำดับที่', value: `#${guild.memberCount}`, inline: true },
      { name: '📅 สร้างบัญชีเมื่อ', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setImage(config.welcome?.gifUrl || 'https://media.giphy.com/media/l4pT7ZzGjG0jZ9Vvy/giphy.gif')
    .setFooter({ text: `mini marilyn • Welcome System • ${guild.name}`, iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({
    content: `✨ **[พรีวิวระบบต้อนรับสำหรับเซิร์ฟเวอร์ ${guild.name}]** นี่คือตัวอย่างการ์ดต้อนรับ:`,
    embeds: [embed]
  });
}
