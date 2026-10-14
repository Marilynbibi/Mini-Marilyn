import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('editgoodbye')
  .setDescription('แก้ไขข้อความบอกลาสมาชิกที่ออกจากเซิร์ฟเวอร์ (Goodbye Message)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('message')
      .setDescription('ข้อความบอกลาใหม่ (รองรับ \\n ขึ้นบรรทัดใหม่, {user}, {server}, {count})')
      .setRequired(true)
  );

export async function execute(interaction) {
  const newMessage = interaction.options.getString('message').replace(/\\n/g, '\n');

  const config = getGuildConfig(interaction.guildId);
  config.goodbye = config.goodbye || {};
  config.goodbye.message = newMessage;
  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('📝 แก้ไขข้อความบอกลาสำเร็จ!')
    .setDescription(`mini marilyn อัปเดตข้อความบอกลาสำหรับ **${interaction.guild.name}** เรียบร้อยแล้วค่ะ`)
    .addFields(
      { name: '💬 ข้อความบอกลาใหม่:', value: newMessage }
    )
    .setFooter({ text: 'พิมพ์ /testgoodbye เพื่อดูตัวอย่างการ์ดจริงได้เลยค่ะ' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
