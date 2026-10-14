import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('editmessage')
  .setDescription('แก้ไขข้อความ/ประกาศที่ mini marilyn เคยส่งไว้')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('ห้องที่ข้อความนั้นอยู่')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('message_id')
      .setDescription('Message ID ของข้อความที่ต้องการแก้ไข (คลิกขวาที่ข้อความ > Copy Message ID)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('new_message')
      .setDescription('เนื้อหาข้อความใหม่ (ใช้ \\n ขึ้นบรรทัดใหม่ได้)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('new_title')
      .setDescription('หัวข้อใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)')
      .setRequired(false)
  )
  .addAttachmentOption(option =>
    option.setName('new_image_file')
      .setDescription('อัปโหลดไฟล์รูปภาพ หรือ GIF ใหม่จากเครื่อง')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('new_image')
      .setDescription('หรือใส่ลิงก์รูปภาพ / GIF ใหม่')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex ใหม่')
      .setRequired(false)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const messageId = interaction.options.getString('message_id').trim();
  const newMessage = interaction.options.getString('new_message').replace(/\\n/g, '\n');
  const newTitle = interaction.options.getString('new_title');
  const newImageFile = interaction.options.getAttachment('new_image_file');
  const newImage = interaction.options.getString('new_image');
  const color = interaction.options.getString('color') || '#FFB6C1';

  try {
    const targetMsg = await channel.messages.fetch(messageId).catch(() => null);

    if (!targetMsg) {
      return interaction.reply({
        content: `❌ ไม่พบข้อความ ID \`${messageId}\` ในห้อง <#${channel.id}>\nโปรดตรวจสอบว่าข้อความอยู่ในห้องดังกล่าวและคัดลอก Message ID ถูกต้องนะคะ`,
        ephemeral: true
      });
    }

    if (targetMsg.author.id !== interaction.client.user.id) {
      return interaction.reply({
        content: '❌ บอทสามารถแก้ไขได้เฉพาะข้อความที่ตัวบอท mini marilyn เป็นผู้ส่งเท่านั้นค่ะ',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(newTitle ? `📢 ${newTitle}` : (targetMsg.embeds[0]?.title || '📢 ประกาศ'))
      .setDescription(newMessage)
      .setAuthor({
        name: `${interaction.guild.name} • ประกาศทางการ`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setFooter({
        text: `แก้ไขล่าสุดโดย ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    if (newImageFile) {
      embed.setImage(newImageFile.url);
    } else if (newImage) {
      embed.setImage(newImage);
    } else if (targetMsg.embeds[0]?.image?.url) {
      embed.setImage(targetMsg.embeds[0].image.url);
    }

    await targetMsg.edit({ embeds: [embed] });

    await interaction.reply({
      content: `✅ แก้ไขข้อความในห้อง <#${channel.id}> เรียบร้อยแล้ว!`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Error editing message:', error);
    await interaction.reply({
      content: `❌ เกิดข้อผิดพลาดในการแก้ไขข้อความ: ${error.message}`,
      ephemeral: true
    });
  }
}
