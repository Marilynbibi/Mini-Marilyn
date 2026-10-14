import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('editwelcome')
  .setDescription('แก้ไขข้อความต้อนรับสมาชิกใหม่ (Welcome Message)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('message')
      .setDescription('ข้อความต้อนรับใหม่ (รองรับ \\n ขึ้นบรรทัดใหม่, {user}, {server}, {count})')
      .setRequired(true)
  );

export async function execute(interaction) {
  const newMessage = interaction.options.getString('message').replace(/\\n/g, '\n');

  const config = getGuildConfig(interaction.guildId);
  config.welcome = config.welcome || {};
  config.welcome.message = newMessage;
  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('📝 แก้ไขข้อความต้อนรับสำเร็จ!')
    .setDescription(`mini marilyn อัปเดตข้อความต้อนรับสำหรับ **${interaction.guild.name}** เรียบร้อยแล้วค่ะ`)
    .addFields(
      { name: '💬 ข้อความต้อนรับใหม่:', value: newMessage }
    )
    .setFooter({ text: 'พิมพ์ /testwelcome เพื่อดูตัวอย่างการ์ดจริงได้เลยค่ะ' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
