import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setgoodbyegif')
  .setDescription('เปลี่ยนภาพเคลื่อนไหว GIF สำหรับระบบบอกลา (Goodbye GIF)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addAttachmentOption(option =>
    option.setName('file')
      .setDescription('อัปโหลดไฟล์ภาพ GIF หรือรูปภาพจากเครื่องของคุณโดยตรง (แนะนำ 👍)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('url')
      .setDescription('หรือใส่ลิงก์ตรงของรูปภาพ/GIF')
      .setRequired(false)
  );

export async function execute(interaction) {
  const attachment = interaction.options.getAttachment('file');
  const urlOption = interaction.options.getString('url');

  let finalUrl = null;

  if (attachment) {
    if (attachment.contentType && (attachment.contentType.startsWith('image/') || attachment.name.match(/\.(gif|png|jpe?g|webp)$/i))) {
      finalUrl = attachment.url;
    } else {
      return interaction.reply({
        content: '❌ ไฟล์ที่อัปโหลดต้องเป็นรูปภาพหรือภาพเคลื่อนไหว GIF เท่านั้นนะคะ',
        ephemeral: true
      });
    }
  } else if (urlOption) {
    const trimmed = urlOption.trim();

    if (trimmed.includes('pin.it') || trimmed.includes('pinterest.com/pin/')) {
      return interaction.reply({
        content: '⚠️ ลิงก์ Pinterest (`pin.it`) เป็นหน้าเว็บ ไม่ใช่ลิงก์รูปตรงค่ะ\n\n💡 **วิธีแก้:** ดาวน์โหลดรูป GIF ลงเครื่องแล้วเลือกช่อง **`file`** เพื่ออัปโหลดได้เลยค่ะ!',
        ephemeral: true
      });
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return interaction.reply({
        content: '❌ โปรดใส่ URL ที่ถูกต้อง (ขึ้นต้นด้วย `https://`)',
        ephemeral: true
      });
    }

    finalUrl = trimmed;
  } else {
    return interaction.reply({
      content: '❌ โปรดเลือกอัปโหลดไฟล์ในช่อง **`file`** หรือใส่ลิงก์ในช่อง **`url`** อย่างใดอย่างหนึ่งนะคะ',
      ephemeral: true
    });
  }

  const config = getGuildConfig(interaction.guildId);
  config.goodbye = config.goodbye || {};
  config.goodbye.gifUrl = finalUrl;
  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor(config.goodbye.embedColor || '#FFA07A')
    .setTitle('🖼️ เปลี่ยนรูป GIF สำหรับระบบบอกลาเรียบร้อยแล้ว!')
    .setDescription(`mini marilyn จะใช้รูป GIF นี้ในการบอกลาสมาชิกที่ออกจากเซิร์ฟเวอร์ **${interaction.guild.name}** ค่ะ`)
    .setImage(finalUrl)
    .setFooter({ text: 'ใช้คำสั่ง /testgoodbye เพื่อทดสอบดูการ์ดจริงได้เลยค่ะ' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
