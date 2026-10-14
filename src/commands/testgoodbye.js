import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('testgoodbye')
  .setDescription('ทดสอบการแสดงผลการ์ดบอกลาสมาชิก (Goodbye Card Preview)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const config = getGuildConfig(interaction.guildId);
  const user = interaction.user;
  const guild = interaction.guild;

  const rawMessage = config.goodbye?.message || "ลาก่อนนะคะคุณ **{user}** หวังว่าเราจะได้พบกันใหม่อีกครั้งที่ **{server}** นะคะ 🥺👋\nตอนนี้เหลือสมาชิก **{count}** คน";
  const formattedMessage = rawMessage
    .replace(/{user}/g, `<@${user.id}>`)
    .replace(/{username}/g, user.username)
    .replace(/{server}/g, guild.name)
    .replace(/{count}/g, guild.memberCount.toString());

  const embed = new EmbedBuilder()
    .setColor(config.goodbye?.embedColor || '#FFA07A')
    .setAuthor({
      name: `👋 มีสมาชิกออกจาก ${guild.name}`,
      iconURL: guild.iconURL({ dynamic: true }) || user.displayAvatarURL({ dynamic: true })
    })
    .setTitle(`🥺 บ๊ายบายคุณ ${user.displayName || user.username}...`)
    .setDescription(formattedMessage)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: '👤 บัญชี Discord', value: `<@${user.id}> (${user.tag})`, inline: true },
      { name: '👥 สมาชิกที่เหลืออยู่', value: `${guild.memberCount} คน`, inline: true }
    )
    .setImage(config.goodbye?.gifUrl || 'https://media.giphy.com/media/efgV24BqJ0uQz555eG/giphy.gif')
    .setFooter({ text: `mini marilyn • Goodbye System • ${guild.name}`, iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({
    content: `✨ **[พรีวิวระบบบอกลา (Goodbye) สำหรับเซิร์ฟเวอร์ ${guild.name}]** นี่คือตัวอย่างการ์ด:`,
    embeds: [embed]
  });
}
