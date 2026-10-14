import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('ดูข้อมูลสถิติของเซิร์ฟเวอร์ดิสหมาๆ');

export async function execute(interaction) {
  const guild = interaction.guild;
  const owner = await guild.fetchOwner();
  const totalMembers = guild.memberCount;
  const totalChannels = guild.channels.cache.size;
  const totalRoles = guild.roles.cache.size;

  const embed = new EmbedBuilder()
    .setColor('#FFB6C1')
    .setTitle(`🐶 ข้อมูลเซิร์ฟเวอร์: ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: '👑 เจ้าของเซิร์ฟเวอร์', value: `<@${owner.id}> (${owner.user.tag})`, inline: true },
      { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
      { name: '📅 วันที่สร้างเซิร์ฟ', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`, inline: false },
      { name: '👥 จำนวนสมาชิกทั้งหมด', value: `**${totalMembers}** คน`, inline: true },
      { name: '💬 จำนวนห้องทั้งหมด', value: `**${totalChannels}** ห้อง`, inline: true },
      { name: '🛡️ จำนวนยศทั้งหมด', value: `**${totalRoles}** ยศ`, inline: true }
    )
    .setFooter({ text: 'mini marilyn • ดิสหมาๆ', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
