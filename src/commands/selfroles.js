import { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ChannelType, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';

export function getGeneralRoleEmoji(roleName) {
  const lower = roleName.toLowerCase();
  if (lower.includes('แจ้งเตือน') || lower.includes('notify') || lower.includes('ping') || lower.includes('bell')) return '🔔';
  if (lower.includes('ข่าว') || lower.includes('news') || lower.includes('update') || lower.includes('ประกาศ')) return '📢';
  if (lower.includes('กิจกรรม') || lower.includes('event')) return '🎪';
  if (lower.includes('สตรีม') || lower.includes('stream') || lower.includes('live') || lower.includes('ไลฟ์')) return '🔴';
  if (lower.includes('วาด') || lower.includes('art') || lower.includes('draw')) return '🎨';
  if (lower.includes('เพลง') || lower.includes('music') || lower.includes('song')) return '🎵';
  if (lower.includes('หนัง') || lower.includes('movie') || lower.includes('anime') || lower.includes('อนิเมะ') || lower.includes('ซีรีส์')) return '🎬';
  if (lower.includes('คุย') || lower.includes('chat') || lower.includes('talk')) return '💬';
  if (lower.includes('แจก') || lower.includes('giveaway')) return '🎁';
  if (lower.includes('โสด') || lower.includes('single')) return '🤍';
  if (lower.includes('มีแฟน') || lower.includes('taken') || lower.includes('couple') || lower.includes('รัก')) return '💖';
  if (lower.includes('ทำงาน') || lower.includes('work') || lower.includes('วัยทำงาน')) return '💼';
  if (lower.includes('เรียน') || lower.includes('study') || lower.includes('student') || lower.includes('วัยเรียน')) return '📚';
  if (lower.includes('18+') || lower.includes('adult')) return '🔞';
  if (lower.includes('เกม') || lower.includes('game')) return '🎮';
  if (lower.includes('รูป') || lower.includes('photo')) return '📷';
  if (lower.includes('กาแฟ') || lower.includes('coffee') || lower.includes('คาเฟ่')) return '☕';
  if (lower.includes('แมว') || lower.includes('cat')) return '🐱';
  if (lower.includes('หมา') || lower.includes('dog')) return '🐶';
  return '🎀';
}

export const data = new SlashCommandBuilder()
  .setName('selfroles')
  .setDescription('สร้างแผงเลือกยศทั่วไป (แจ้งเตือน / สถานะ / งานอดิเรก / Self Roles)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption(opt => opt.setName('role_1').setDescription('เลือกยศที่ 1').setRequired(true))
  .addRoleOption(opt => opt.setName('role_2').setDescription('เลือกยศที่ 2').setRequired(false))
  .addRoleOption(opt => opt.setName('role_3').setDescription('เลือกยศที่ 3').setRequired(false))
  .addRoleOption(opt => opt.setName('role_4').setDescription('เลือกยศที่ 4').setRequired(false))
  .addRoleOption(opt => opt.setName('role_5').setDescription('เลือกยศที่ 5').setRequired(false))
  .addRoleOption(opt => opt.setName('role_6').setDescription('เลือกยศที่ 6').setRequired(false))
  .addRoleOption(opt => opt.setName('role_7').setDescription('เลือกยศที่ 7').setRequired(false))
  .addRoleOption(opt => opt.setName('role_8').setDescription('เลือกยศที่ 8').setRequired(false))
  .addRoleOption(opt => opt.setName('role_9').setDescription('เลือกยศที่ 9').setRequired(false))
  .addRoleOption(opt => opt.setName('role_10').setDescription('เลือกยศที่ 10').setRequired(false))
  .addStringOption(opt =>
    opt.setName('style')
      .setDescription('รูปแบบแสดงผล (ปุ่มกด หรือ เมนูดรอปดาวน์)')
      .setRequired(false)
      .addChoices(
        { name: '🔘 ปุ่มกดแยกแต่ละยศ (Buttons) - น่ารัก กดสะดวก', value: 'buttons' },
        { name: '📜 เมนูดรอปดาวน์ (Select Menu) - เลือกหลายยศในเมนูเดียว', value: 'dropdown' }
      )
  )
  .addChannelOption(opt =>
    opt.setName('channel')
      .setDescription('ห้องที่ต้องการส่งแผงกดยศ (หากไม่ระบุจะส่งห้องนี้)')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .addStringOption(opt =>
    opt.setName('title')
      .setDescription('หัวข้อการ์ด (เช่น: ✨ รับยศทั่วไป / Self Roles)')
      .setRequired(false)
  )
  .addStringOption(opt =>
    opt.setName('description')
      .setDescription('คำอธิบายบนการ์ด (ใช้ \\n ขึ้นบรรทัดใหม่ได้)')
      .setRequired(false)
  )
  .addStringOption(opt =>
    opt.setName('color')
      .setDescription('รหัสสี Hex ของการ์ด (เช่น: #FFB6C1)')
      .setRequired(false)
  )
  .addAttachmentOption(opt =>
    opt.setName('image_file')
      .setDescription('อัปโหลดรูปภาพ หรือ GIF ประกอบการ์ดจากเครื่อง')
      .setRequired(false)
  )
  .addStringOption(opt =>
    opt.setName('image_url')
      .setDescription('หรือใส่ลิงก์รูปภาพ / GIF (ไม่บังคับ)')
      .setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply({ flags: 64 });

  const rawRoles = [
    interaction.options.getRole('role_1'),
    interaction.options.getRole('role_2'),
    interaction.options.getRole('role_3'),
    interaction.options.getRole('role_4'),
    interaction.options.getRole('role_5'),
    interaction.options.getRole('role_6'),
    interaction.options.getRole('role_7'),
    interaction.options.getRole('role_8'),
    interaction.options.getRole('role_9'),
    interaction.options.getRole('role_10'),
  ].filter(Boolean);

  // Filter unique roles
  const roles = [];
  const seenIds = new Set();
  for (const r of rawRoles) {
    if (!seenIds.has(r.id)) {
      seenIds.add(r.id);
      roles.push(r);
    }
  }

  if (roles.length === 0) {
    return interaction.editReply({
      content: '⚠️ กรุณาระบุยศอย่างน้อย 1 ยศค่ะ'
    });
  }

  // Check role hierarchy with bot
  const botMember = interaction.guild.members.me;
  const higherRoles = roles.filter(r => r.position >= botMember.roles.highest.position);

  if (higherRoles.length > 0) {
    const names = higherRoles.map(r => `**${r.name}**`).join(', ');
    return interaction.editReply({
      content: `❌ บอทไม่สามารถจัดการยศ ${names} ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท\nโปรดไปที่ **Server Settings > Roles** แล้วลากยศของ mini marilyn ให้อยู่เหนือยศดังกล่าว แล้วลองใหม่อีกครั้งนะคะ`
    });
  }

  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
  const style = interaction.options.getString('style') || 'buttons';
  const title = interaction.options.getString('title') || '✨ รับยศทั่วไป / Self Roles';
  const description = (interaction.options.getString('description') ||
    'ยินดีต้อนรับสู่เซิร์ฟเวอร์ของเราค่ะ! 💖\n' +
    'โปรดกดเลือกยศที่คุณต้องการด้านล่าง เพื่อตกแต่งโปรไฟล์หรือรับการแจ้งเตือนต่างๆ ได้เลยนะคะ\n' +
    '*(สามารถกดรับได้หลายยศ และกดปุ่มเดิมซ้ำเพื่อยกเลิกได้ตลอดเวลาค่ะ)*')
    .replace(/\\n/g, '\n');

  const color = interaction.options.getString('color') || '#FFB6C1';
  const imageFile = interaction.options.getAttachment('image_file');
  const imageUrl = interaction.options.getString('image_url');

  // Build Embed
  const embed = new EmbedBuilder()
    .setColor(color.startsWith('#') ? color : '#FFB6C1')
    .setTitle(title)
    .setDescription(description)
    .setAuthor({
      name: `${interaction.guild.name} • ระบบยศสมาชิก`,
      iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
    })
    .setFooter({
      text: `mini marilyn • Self Roles System 🎀`,
      iconURL: interaction.client.user.displayAvatarURL()
    })
    .setTimestamp();

  // Show list of roles in embed
  const roleListText = roles.map(r => `${getGeneralRoleEmoji(r.name)} <@&${r.id}>`).join('\n');
  embed.addFields({
    name: '🏷️ รายการยศที่มีให้เลือก:',
    value: roleListText
  });

  if (imageFile) {
    embed.setImage(imageFile.url);
  } else if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    embed.setImage(imageUrl);
  }

  const components = [];

  if (style === 'dropdown') {
    // Dropdown Select Menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_self_roles')
      .setPlaceholder('✨ คลิกเพื่อเลือกยศที่คุณต้องการ (เลือกได้หลายยศ)...')
      .setMinValues(0)
      .setMaxValues(roles.length);

    roles.forEach(r => {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(r.name.slice(0, 100))
          .setValue(r.id)
          .setEmoji(getGeneralRoleEmoji(r.name))
          .setDescription(`กดยศ ${r.name.slice(0, 70)}`)
      );
    });

    components.push(new ActionRowBuilder().addComponents(selectMenu));
  } else {
    // Buttons (up to 5 buttons per row)
    let currentRow = new ActionRowBuilder();

    roles.forEach((r) => {
      if (currentRow.components.length === 5) {
        components.push(currentRow);
        currentRow = new ActionRowBuilder();
      }

      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`btn_role_${r.id}`)
          .setLabel(r.name.slice(0, 40))
          .setEmoji(getGeneralRoleEmoji(r.name))
          .setStyle(ButtonStyle.Secondary)
      );
    });

    if (currentRow.components.length > 0) {
      components.push(currentRow);
    }
  }

  try {
    await targetChannel.send({ embeds: [embed], components });
    await interaction.editReply({
      content: `✅ สร้างแผงกดยศทั่วไปเรียบร้อยแล้วค่ะ! ส่งไปยังห้อง <#${targetChannel.id}> 🎀✨`
    });
  } catch (error) {
    console.error('Error sending self roles panel:', error);
    await interaction.editReply({
      content: `❌ เกิดข้อผิดพลาดในการส่งแผงยศ: ${error.message}`
    });
  }
}
