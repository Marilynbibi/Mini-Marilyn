import { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('write')
  .setDescription('เปิดหน้าต่างเขียนข้อความ/การ์ดอะไรก็ได้อิสระ (Discord Modal Form)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  // Create Modal Pop-up
  const modal = new ModalBuilder()
    .setCustomId('modal_write_embed')
    .setTitle('📝 เขียนข้อความของคุณผ่าน mini marilyn');

  // Title input
  const titleInput = new TextInputBuilder()
    .setCustomId('write_title')
    .setLabel('หัวข้อ (Title)')
    .setPlaceholder('ใส่หัวข้อ หรือเว้นว่างไว้ก็ได้')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(256);

  // Description input (Multi-line)
  const contentInput = new TextInputBuilder()
    .setCustomId('write_content')
    .setLabel('เนื้อหาข้อความ (เขียนอะไรก็ได้อิสระ)')
    .setPlaceholder('พิมพ์ข้อความของคุณที่นี่... (เคาะ Enter ขึ้นบรรทัดใหม่ได้เต็มที่)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(4000);

  // Color input
  const colorInput = new TextInputBuilder()
    .setCustomId('write_color')
    .setLabel('รหัสสี Hex (เช่น #FFB6C1 หรือเว้นว่างได้)')
    .setPlaceholder('#FFB6C1')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(7);

  // Image input
  const imageInput = new TextInputBuilder()
    .setCustomId('write_image')
    .setLabel('ลิงก์รูปภาพ หรือ GIF (เว้นว่างได้)')
    .setPlaceholder('https://...')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const row1 = new ActionRowBuilder().addComponents(titleInput);
  const row2 = new ActionRowBuilder().addComponents(contentInput);
  const row3 = new ActionRowBuilder().addComponents(colorInput);
  const row4 = new ActionRowBuilder().addComponents(imageInput);

  modal.addComponents(row1, row2, row3, row4);

  // Show Modal to user
  await interaction.showModal(modal);
}
