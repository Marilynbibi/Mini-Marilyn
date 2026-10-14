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
  .setName('setgender')
  .setDescription('สร้างแผงปุ่มสำหรับเลือกเพศ (Gender Roles Panel)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption(option =>
    option.setName('male_role')
      .setDescription('เลือกยศสำหรับเพศชาย (Male / Boy)')
      .setRequired(true)
  )
  .addRoleOption(option =>
    option.setName('female_role')
      .setDescription('เลือกยศสำหรับเพศหญิง (Female / Girl)')
      .setRequired(true)
  )
  .addRoleOption(option =>
    option.setName('other_role')
      .setDescription('เลือกยศสำหรับ LGBTQ+ / เพศทางเลือก / อื่นๆ')
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('ห้องที่ต้องการส่งการ์ดเลือกเพศ (หากไม่ระบุจะส่งในห้องนี้)')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('หัวข้อบนการ์ด (เช่น: 🎀 เลือกเพศของคุณ / Gender Roles)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('description')
      .setDescription('คำอธิบายบนการ์ด (ใช้ \\n ขึ้นบรรทัดใหม่ได้)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('exclusive')
      .setDescription('เลือกได้เพียงเพศเดียว (ระบบจะสลับยศให้อัตโนมัติเมื่อเลือกอีกเพศ) ค่าเริ่มต้น: ใช่')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex ของการ์ด (เช่น: #FFB6C1)')
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

  const maleRole = interaction.options.getRole('male_role');
  const femaleRole = interaction.options.getRole('female_role');
  const otherRole = interaction.options.getRole('other_role');
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
  const title = interaction.options.getString('title') || '🎀 เลือกเพศของคุณ / Gender Roles';
  const description = (interaction.options.getString('description') || 
    'ยินดีต้อนรับสู่เซิร์ฟเวอร์ของเราค่ะ! ✨\nโปรดกดปุ่มด้านล่างเพื่อเลือกยศเพศที่ตรงกับตัวคุณนะคะ\n*(สามารถกดซ้ำเพื่อยกเลิก หรือกดยศอื่นเพื่อสลับได้ค่ะ)* 💖')
    .replace(/\\n/g, '\n');
  const exclusive = interaction.options.getBoolean('exclusive') ?? true;
  const color = interaction.options.getString('color') || '#FFB6C1';
  const imageFile = interaction.options.getAttachment('image_file');
  const imageUrl = interaction.options.getString('image_url');

  // Check role hierarchy with bot
  const botMember = interaction.guild.members.me;
  const checkRoles = [maleRole, femaleRole, otherRole].filter(Boolean);
  const higherRoles = checkRoles.filter(r => r.position >= botMember.roles.highest.position);

  if (higherRoles.length > 0) {
    const names = higherRoles.map(r => `**${r.name}**`).join(', ');
    return interaction.editReply({
      content: `❌ บอทไม่สามารถจัดการยศ ${names} ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท\nโปรดลากยศของ mini marilyn ใน **Server Settings > Roles** ให้อยู่เหนือยศดังกล่าว แล้วลองใหม่อีกครั้งนะคะ`
    });
  }

  // Save config
  const config = getGuildConfig(interaction.guildId);
  config.gender = {
    enabled: true,
    maleRoleId: maleRole.id,
    femaleRoleId: femaleRole.id,
    otherRoleId: otherRole ? otherRole.id : null,
    exclusive: exclusive
  };
  saveGuildConfig(interaction.guildId, config);

  // Build Embed
  const embed = new EmbedBuilder()
    .setColor(color.startsWith('#') ? color : '#FFB6C1')
    .setTitle(title)
    .setDescription(description)
    .setAuthor({
      name: `${interaction.guild.name} • ระบบเลือกยศ`,
      iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
    })
    .setFooter({
      text: `mini marilyn • Gender Roles System 🎀`,
      iconURL: interaction.client.user.displayAvatarURL()
    })
    .setTimestamp();

  // Add field showing the roles
  const fields = [
    { name: '👦 ชาย (Male)', value: `<@&${maleRole.id}>`, inline: true },
    { name: '👧 หญิง (Female)', value: `<@&${femaleRole.id}>`, inline: true }
  ];
  if (otherRole) {
    fields.push({ name: '🌈 เพศทางเลือก / อื่นๆ', value: `<@&${otherRole.id}>`, inline: true });
  }
  embed.addFields(fields);

  if (imageFile) {
    embed.setImage(imageFile.url);
  } else if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    embed.setImage(imageUrl);
  }

  // Build Action Row
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`btn_gender_${maleRole.id}`)
      .setLabel('ชาย (Male)')
      .setEmoji('👦')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`btn_gender_${femaleRole.id}`)
      .setLabel('หญิง (Female)')
      .setEmoji('👧')
      .setStyle(ButtonStyle.Success)
  );

  if (otherRole) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_gender_${otherRole.id}`)
        .setLabel('LGBTQ+ / อื่นๆ')
        .setEmoji('🌈')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  try {
    await targetChannel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({
      content: `✅ สร้างแผงเลือกเพศเรียบร้อยแล้วค่ะ! ส่งไปยังห้อง <#${targetChannel.id}> 🎀`
    });
  } catch (error) {
    console.error('Error sending gender panel:', error);
    await interaction.editReply({
      content: `❌ เกิดข้อผิดพลาดในการส่งแผงเลือกเพศ: ${error.message}`
    });
  }
}
