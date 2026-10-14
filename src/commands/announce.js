import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('ส่งข้อความประกาศสวยๆ ผ่านบอท mini marilyn')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('ห้องที่ต้องการส่งประกาศ')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('หัวข้อประกาศ')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('message')
      .setDescription('เนื้อหาข้อความประกาศ')
      .setRequired(true)
  )
  .addAttachmentOption(option =>
    option.setName('image_file')
      .setDescription('อัปโหลดรูปภาพ หรือ GIF ประกอบประกาศจากเครื่อง')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('image_url')
      .setDescription('หรือใส่ลิงก์รูปภาพ / GIF')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex (เช่น #FFB6C1 หรือ #5865F2)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const title = interaction.options.getString('title');
  const message = interaction.options.getString('message');
  const imageFile = interaction.options.getAttachment('image_file');
  const imageUrl = interaction.options.getString('image_url');
  const color = interaction.options.getString('color') || '#FFB6C1';

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`📢 ${title}`)
    .setDescription(message.replace(/\\n/g, '\n'))
    .setAuthor({
      name: `${interaction.guild.name} • ประกาศทางการ`,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setFooter({
      text: `ประกาศโดย ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();

  if (imageFile) {
    embed.setImage(imageFile.url);
  } else if (imageUrl) {
    try {
      embed.setImage(imageUrl);
    } catch (_) {}
  }

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: `✅ ส่งประกาศไปยังห้อง <#${channel.id}> สำเร็จแล้ว!`, ephemeral: true });
}
