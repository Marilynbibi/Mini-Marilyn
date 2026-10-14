import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setgoodbye')
  .setDescription('ตั้งค่าระบบบอกลาสมาชิกที่ออกจากเซิร์ฟเวอร์ (Goodbye Channel & GIF)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('เลือกห้องข้อความสำหรับส่งข้อความบอกลา')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('message')
      .setDescription('ข้อความบอกลา (ใช้ {user}, {username}, {server}, {count} ได้)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('gif')
      .setDescription('ใส่ลิงก์ภาพ GIF หรือ URL รูปภาพบอกลา')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex ของแถบ Embed (เช่น #FFA07A หรือ #FF6B6B)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('enabled')
      .setDescription('เปิดหรือปิดระบบบอกลา (เปิดเป็นค่าเริ่มต้น)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const customMessage = interaction.options.getString('message');
  const gifUrl = interaction.options.getString('gif');
  const color = interaction.options.getString('color');
  const isEnabled = interaction.options.getBoolean('enabled') ?? true;

  const config = getGuildConfig(interaction.guildId);
  config.goodbye = config.goodbye || {};
  config.goodbye.channelId = channel.id;
  config.goodbye.enabled = isEnabled;
  if (customMessage) {
    config.goodbye.message = customMessage;
  }
  if (gifUrl) {
    config.goodbye.gifUrl = gifUrl;
  }
  if (color) {
    config.goodbye.embedColor = color;
  }

  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor(config.goodbye.embedColor || '#FFA07A')
    .setTitle('✅ ตั้งค่าระบบ Goodbye สำเร็จ!')
    .setDescription(`mini marilyn จะส่งการ์ดบอกลาสมาชิกที่ห้อง <#${channel.id}> ในเซิร์ฟเวอร์ **${interaction.guild.name}**`)
    .addFields(
      { name: '📢 สถานะระบบ', value: isEnabled ? '🟢 เปิดใช้งาน (Active)' : '🔴 ปิดใช้งาน (Disabled)', inline: true },
      { name: '📍 ห้องบอกลา', value: `<#${channel.id}>`, inline: true },
      { name: '📝 ตัวอย่างข้อความ', value: config.goodbye.message || 'ค่าเริ่มต้น' }
    )
    .setFooter({ text: 'สามารถใช้ /testgoodbye เพื่อดูตัวอย่างการ์ดได้เลยค่ะ' });

  if (config.goodbye.gifUrl) {
    embed.addFields({ name: '🖼️ รูป GIF ที่ตั้งไว้', value: config.goodbye.gifUrl });
    try {
      embed.setImage(config.goodbye.gifUrl);
    } catch (_) {}
  }

  await interaction.reply({ embeds: [embed] });
}
