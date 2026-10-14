import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('ให้บอทพิมพ์ส่งข้อความธรรมดาอะไรก็ได้แทนเรา')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('message')
      .setDescription('ข้อความที่ต้องการให้บอทพูด (ใช้ \\n เพื่อขึ้นบรรทัดใหม่ได้)')
      .setRequired(true)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('ห้องที่ต้องการให้บอทส่งข้อความ (หากไม่เลือกจะส่งในห้องนี้)')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction) {
  const message = interaction.options.getString('message').replace(/\\n/g, '\n');
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

  await targetChannel.send(message);
  await interaction.reply({
    content: `✅ ส่งข้อความไปยังห้อง <#${targetChannel.id}> เรียบร้อยแล้วค่ะ!`,
    ephemeral: true
  });
}
