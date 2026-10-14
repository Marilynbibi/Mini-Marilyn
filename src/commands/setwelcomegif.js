import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setwelcomegif')
  .setDescription('เปลี่ยนภาพเคลื่อนไหว GIF ต้อนรับสมาชิกใหม่ (รองรับการอัปโหลดไฟล์โดยตรง)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addAttachmentOption(option =>
    option.setName('file')
      .setDescription('อัปโหลดไฟล์ภาพ GIF หรือรูปภาพจากเครื่องของคุณโดยตรง (แนะนำ 👍)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('url')
      .setDescription('หรือใส่ลิงก์ตรงของรูปภาพ/GIF (ต้องลงท้ายด้วย .gif, .png, .jpg หรือลิงก์ตรง Discord CDN/Giphy)')
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
        content: '⚠️ ลิงก์ Pinterest (`pin.it`) เป็นหน้าเว็บ ไม่ใช่ลิงก์รูปตรงค่ะ\n\n💡 **วิธีแก้ที่ง่ายที่สุด:**\n1. ดาวน์โหลดรูป GIF จาก Pinterest ลงเครื่อง\n2. พิมพ์ `/setwelcomegif` แล้วเลือกช่อง **`file`** เพื่ออัปโหลดไฟล์ GIF นั้นได้เลยค่ะ! 🎉\n*(หรือคลิกขวาที่รูปใน Pinterest แล้วเลือก "คัดลอกที่อยู่รูปภาพ / Copy image address")*',
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
  config.welcome = config.welcome || {};
  config.welcome.gifUrl = finalUrl;
  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor(config.welcome.embedColor || '#FFB6C1')
    .setTitle('🖼️ เปลี่ยนรูป GIF ต้อนรับเรียบร้อยแล้ว!')
    .setDescription(`mini marilyn จะใช้รูป GIF นี้ในการต้อนรับสมาชิกใหม่ของเซิร์ฟเวอร์ **${interaction.guild.name}** ค่ะ 💕`)
    .setImage(finalUrl)
    .setFooter({ text: 'ใช้คำสั่ง /testwelcome เพื่อทดสอบดูการ์ดจริงได้เลยค่ะ' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
