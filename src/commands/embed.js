import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('สร้างการ์ด Embed เขียนอะไรก็ได้ตามใจชอบ')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('content')
      .setDescription('เนื้อหาข้อความในการ์ด (ใช้ \\n ขึ้นบรรทัดใหม่ได้)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('หัวข้อการ์ด (ไม่บังคับ)')
      .setRequired(false)
  )
  .addAttachmentOption(option =>
    option.setName('image_file')
      .setDescription('อัปโหลดรูปภาพ หรือ GIF ประกอบการ์ดจากเครื่อง')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('image_url')
      .setDescription('หรือใส่ลิงก์รูปภาพ / GIF')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex (เช่น #FFB6C1)')
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('ห้องที่ต้องการส่งการ์ด (หากไม่เลือกจะส่งในห้องนี้)')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction) {
  const content = interaction.options.getString('content').replace(/\\n/g, '\n');
  const title = interaction.options.getString('title');
  const imageFile = interaction.options.getAttachment('image_file');
  const imageUrl = interaction.options.getString('image_url');
  const color = interaction.options.getString('color') || '#FFB6C1';
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setDescription(content)
    .setFooter({
      text: `${interaction.guild.name}`,
      iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
    })
    .setTimestamp();

  if (title) {
    embed.setTitle(title);
  }

  if (imageFile) {
    embed.setImage(imageFile.url);
  } else if (imageUrl) {
    embed.setImage(imageUrl);
  }

  await targetChannel.send({ embeds: [embed] });
  await interaction.reply({
    content: `✅ ส่งการ์ดข้อความไปยังห้อง <#${targetChannel.id}> เรียบร้อยแล้วค่ะ!`,
    ephemeral: true
  });
}
