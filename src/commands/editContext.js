import { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
  .setName('📝 แก้ไขข้อความนี้')
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const targetMessage = interaction.targetMessage;

  // Check if message belongs to bot
  if (targetMessage.author.id !== interaction.client.user.id) {
    return interaction.reply({
      content: '❌ สามารถแก้ไขได้เฉพาะข้อความที่ส่งโดยบอท mini marilyn เท่านั้นค่ะ',
      flags: 64
    });
  }

  // Extract existing content
  let existingTitle = '';
  let existingContent = '';
  let isEmbed = false;

  if (targetMessage.embeds.length > 0) {
    isEmbed = true;
    const embed = targetMessage.embeds[0];
    existingTitle = embed.title || '';
    existingContent = embed.description || '';
  } else {
    existingContent = targetMessage.content || '';
  }

  // Create Modal with custom ID containing target message ID and channel ID
  const modal = new ModalBuilder()
    .setCustomId(`modal_edit_msg_${targetMessage.channelId}_${targetMessage.id}`)
    .setTitle('📝 แก้ไขข้อความของบอท');

  const titleInput = new TextInputBuilder()
    .setCustomId('edit_title')
    .setLabel('หัวข้อ (Title)')
    .setValue(existingTitle.slice(0, 256))
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const contentInput = new TextInputBuilder()
    .setCustomId('edit_content')
    .setLabel('เนื้อหาข้อความ (แก้ไขได้อิสระ)')
    .setValue(existingContent.slice(0, 4000))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const imageInput = new TextInputBuilder()
    .setCustomId('edit_image')
    .setLabel('ลิงก์รูปภาพ หรือ GIF (เว้นว่างได้)')
    .setPlaceholder('https://...')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const row1 = new ActionRowBuilder().addComponents(titleInput);
  const row2 = new ActionRowBuilder().addComponents(contentInput);
  const row3 = new ActionRowBuilder().addComponents(imageInput);

  modal.addComponents(row1, row2, row3);

  await interaction.showModal(modal);
}
