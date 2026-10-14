import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('ดูข้อมูลโปรไฟล์และยศของสมาชิกในเซิร์ฟเวอร์')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('เลือกสมาชิกที่ต้องการดูข้อมูล (หากไม่เลือกจะดูของตัวเอง)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: '❌ ไม่พบข้อมูลสมาชิกคนนี้ในเซิร์ฟเวอร์', ephemeral: true });
  }

  const roles = member.roles.cache
    .filter(r => r.id !== interaction.guild.id)
    .sort((a, b) => b.position - a.position)
    .map(r => `<@&${r.id}>`)
    .join(' ') || '*ไม่มียศ*';

  const embed = new EmbedBuilder()
    .setColor(member.displayHexColor !== '#000000' ? member.displayHexColor : '#FFB6C1')
    .setTitle(`👤 ข้อมูลของ ${targetUser.username}`)
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: '📛 ชื่อแสดงผล', value: member.displayName, inline: true },
      { name: '🆔 User ID', value: `\`${targetUser.id}\``, inline: true },
      { name: '🤖 บอท?', value: targetUser.bot ? 'ใช่' : 'ไม่ใช่', inline: true },
      { name: '📅 วันที่สมัคร Discord', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:D>`, inline: true },
      { name: '📥 วันที่เข้าดิสหมาๆ', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`, inline: true },
      { name: `🛡️ ยศที่ครอบครอง (${member.roles.cache.size - 1})`, value: roles.length > 1024 ? roles.substring(0, 1020) + '...' : roles, inline: false }
    )
    .setFooter({ text: 'mini marilyn • ข้อมูลสมาชิก', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
