import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('สร้างกล่อง "กดตรงนี้เพื่อรับยศ" / กล่องยืนยันตัวตน (Verification Panel)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption(option =>
    option.setName('role')
      .setDescription('เลือกยศที่สมาชิกจะได้รับเมื่อกดปุ่ม')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('button_text')
      .setDescription('ข้อความบนปุ่ม (ค่าเริ่มต้น: 🎀 กดตรงนี้เพื่อรับยศ)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('หัวข้อการ์ด (ค่าเริ่มต้น: ⋆. 🎀 ยืนยันตัวตนเพื่อรับยศ ˚⋆)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('description')
      .setDescription('คำอธิบาย (ใช้ \\n ขึ้นบรรทัดใหม่ได้)')
      .setRequired(false)
  )
  .addAttachmentOption(option =>
    option.setName('image_file')
      .setDescription('อัปโหลดรูปภาพ หรือ GIF ประกอบการ์ดจากเครื่องของคุณ')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('image_url')
      .setDescription('หรือใส่ลิงก์รูปภาพ / GIF ตรง')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex ของแถบการ์ด (เช่น #FFB6C1)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const role = interaction.options.getRole('role');
  const buttonText = interaction.options.getString('button_text') || 'กดตรงนี้เพื่อรับยศ 🎀';
  const title = interaction.options.getString('title') || '⋆. 🎀 ยืนยันตัวตนเพื่อรับยศ ˚⋆';
  const rawDesc = interaction.options.getString('description') || `ยินดีต้อนรับสู่ **${interaction.guild.name}**!\nโปรดกดปุ่มด้านล่างเพื่อรับยศ <@&${role.id}> และปลดล็อกห้องแชททั้งหมดค่ะ 💕`;
  const description = rawDesc.replace(/\\n/g, '\n');
  const imageFile = interaction.options.getAttachment('image_file');
  const imageUrl = interaction.options.getString('image_url');
  const color = interaction.options.getString('color') || '#FFB6C1';

  // Check bot role hierarchy
  const botMember = interaction.guild.members.me;
  if (role.position >= botMember.roles.highest.position) {
    return interaction.reply({
      content: `❌ ไม่สามารถสร้างปุ่มสำหรับยศ **${role.name}** ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท mini marilyn\nโปรดไปที่ Server Settings > Roles แล้วลากยศของบอทให้อยู่เหนือยศดังกล่าวค่ะ`,
      ephemeral: true
    });
  }

  const customId = `btn_role_${role.id}`;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { name: '🏷️ ยศที่จะได้รับ:', value: `<@&${role.id}>`, inline: true }
    )
    .setFooter({ text: `${interaction.guild.name} • กดปุ่มเพื่อรับ/ยกเลิกยศ`, iconURL: interaction.client.user.displayAvatarURL() });

  if (imageFile) {
    embed.setImage(imageFile.url);
  } else if (imageUrl) {
    embed.setImage(imageUrl);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(buttonText)
      .setEmoji('🎀')
      .setStyle(ButtonStyle.Success) // Cute Green Button
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({
    content: `✅ สร้างกล่อง **"กดตรงนี้เพื่อรับยศ"** สำหรับยศ <@&${role.id}> เรียบร้อยแล้วค่ะ!`,
    ephemeral: true
  });
}
