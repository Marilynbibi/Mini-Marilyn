import { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ChannelType, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setticket')
  .setDescription('สร้างแผงตั๋วช่วยเหลือ / ติดต่อทีมงาน (Ticket Support Panel)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('ห้องที่ต้องการส่งการ์ดแผง Ticket (หากไม่เลือกจะส่งห้องนี้)')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('category')
      .setDescription('หมวดหมู่ (Category) ที่จะใช้สร้างห้อง Ticket ของสมาชิก')
      .addChannelTypes(ChannelType.GuildCategory)
      .setRequired(false)
  )
  .addRoleOption(option =>
    option.setName('support_role')
      .setDescription('ยศทีมงาน/แอดมินที่จะให้สิทธิ์เข้าดูแลห้อง Ticket')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('หัวข้อบนการ์ด Ticket (เช่น 🎫 ติดต่อทีมงาน / แจ้งปัญหา)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('description')
      .setDescription('คำอธิบายบนการ์ด (ใช้ \\n ขึ้นบรรทัดใหม่ได้)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('button_text')
      .setDescription('ข้อความบนปุ่มกด (เช่น 📩 เปิด Ticket ติดต่อ)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex ของการ์ด (เช่น #FFB6C1)')
      .setRequired(false)
  )
  .addAttachmentOption(option =>
    option.setName('image_file')
      .setDescription('อัปโหลดรูปภาพ หรือ GIF ประกอบการ์ดจากเครื่อง')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('image_url')
      .setDescription('หรือใส่ลิงก์รูปภาพ / GIF (ไม่บังคับ)')
      .setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply({ flags: 64 });

  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
  const category = interaction.options.getChannel('category');
  const supportRole = interaction.options.getRole('support_role');
  const title = interaction.options.getString('title') || '🎫 ติดต่อทีมงาน / แจ้งปัญหา (Support Ticket)';
  const description = (interaction.options.getString('description') || 
    'หากคุณต้องการความช่วยเหลือ ติดต่อสอบถาม หรือแจ้งปัญหาใดๆ ในเซิร์ฟเวอร์\nสามารถกดปุ่ม **"📩 เปิด Ticket ติดต่อ"** ด้านล่างเพื่อสร้างห้องคุยส่วนตัวกับทีมงานได้ทันทีค่ะ 🎀')
    .replace(/\\n/g, '\n');
  const buttonText = interaction.options.getString('button_text') || '📩 เปิด Ticket ติดต่อ';
  const color = interaction.options.getString('color') || '#FFB6C1';
  const imageFile = interaction.options.getAttachment('image_file');
  const imageUrl = interaction.options.getString('image_url');

  // Save settings in guild config
  const config = getGuildConfig(interaction.guildId);
  config.ticket = {
    ...config.ticket,
    enabled: true,
    panelChannelId: targetChannel.id,
    categoryId: category ? category.id : config.ticket?.categoryId || null,
    supportRoleId: supportRole ? supportRole.id : config.ticket?.supportRoleId || null
  };
  saveGuildConfig(interaction.guildId, config);

  // Build Ticket Panel Embed
  const embed = new EmbedBuilder()
    .setColor(color.startsWith('#') ? color : '#FFB6C1')
    .setTitle(title)
    .setDescription(description)
    .setAuthor({
      name: `${interaction.guild.name} • ระบบช่วยเหลือ`,
      iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
    })
    .setFooter({
      text: `mini marilyn • Ticket System 🎀`,
      iconURL: interaction.client.user.displayAvatarURL()
    })
    .setTimestamp();

  if (imageFile) {
    embed.setImage(imageFile.url);
  } else if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    embed.setImage(imageUrl);
  }

  // Create Button
  const button = new ButtonBuilder()
    .setCustomId('btn_ticket_open')
    .setLabel(buttonText.slice(0, 45))
    .setStyle(ButtonStyle.Primary)
    .setEmoji('📩');

  const row = new ActionRowBuilder().addComponents(button);

  // Send Panel to target channel
  await targetChannel.send({
    embeds: [embed],
    components: [row]
  });

  let responseInfo = `✅ **สร้างแผง Ticket สำเร็จเรียบร้อยแล้วค่ะ!**\n\n` +
    `📍 **ห้องแผงควบคุม:** <#${targetChannel.id}>\n` +
    `📁 **หมวดหมู่ที่สร้างห้อง:** ${category ? `<#${category.id}>` : '*(โฟลเดอร์หลัก / ค่าเริ่มต้น)*'}\n` +
    `🛡️ **ยศทีมงานดูแล:** ${supportRole ? `<@&${supportRole.id}>` : '*(ไม่ได้ระบุ - แอดมินดูแล)*'}\n\n` +
    `✨ สมาชิกในเซิร์ฟเวอร์สามารถกดปุ่ม **${buttonText}** เพื่อเปิดห้องตั๋วส่วนตัวได้ทันทีค่ะ!`;

  await interaction.editReply({ content: responseInfo });
}
