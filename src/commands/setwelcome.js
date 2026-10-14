import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setwelcome')
  .setDescription('ตั้งค่าระบบต้อนรับสมาชิกใหม่ (Welcome Channel & GIF)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('เลือกห้องข้อความสำหรับส่งข้อความต้อนรับ')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('message')
      .setDescription('ข้อความต้อนรับ (ใช้ {user}, {server}, {count} ได้)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('gif')
      .setDescription('ใส่ลิงก์ภาพ GIF หรือ URL รูปภาพต้อนรับ')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('color')
      .setDescription('รหัสสี Hex ของแถบ Embed (เช่น #FFB6C1 หรือ #5865F2)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('enabled')
      .setDescription('เปิดหรือปิดระบบต้อนรับ (เปิดเป็นค่าเริ่มต้น)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const customMessage = interaction.options.getString('message');
  const gifUrl = interaction.options.getString('gif');
  const color = interaction.options.getString('color');
  const isEnabled = interaction.options.getBoolean('enabled') ?? true;

  const config = getGuildConfig(interaction.guildId);
  config.welcome = config.welcome || {};
  config.welcome.channelId = channel.id;
  config.welcome.enabled = isEnabled;
  if (customMessage) {
    config.welcome.message = customMessage;
  }
  if (gifUrl) {
    config.welcome.gifUrl = gifUrl;
  }
  if (color) {
    config.welcome.embedColor = color;
  }

  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor(config.welcome.embedColor || '#57F287')
    .setTitle('✅ ตั้งค่าระบบต้อนรับสำเร็จ!')
    .setDescription(`mini marilyn จะส่งการ์ดต้อนรับสมาชิกใหม่ที่ห้อง <#${channel.id}> ในเซิร์ฟเวอร์ **${interaction.guild.name}**`)
    .addFields(
      { name: '📢 สถานะระบบ', value: isEnabled ? '🟢 เปิดใช้งาน (Active)' : '🔴 ปิดใช้งาน (Disabled)', inline: true },
      { name: '📍 ห้องต้อนรับ', value: `<#${channel.id}>`, inline: true },
      { name: '📝 ตัวอย่างข้อความ', value: config.welcome.message || 'ค่าเริ่มต้น' }
    )
    .setFooter({ text: 'สามารถใช้ /testwelcome เพื่อดูตัวอย่างการ์ดได้เลยค่ะ' });

  if (config.welcome.gifUrl) {
    embed.addFields({ name: '🖼️ รูป GIF ที่ตั้งไว้', value: config.welcome.gifUrl });
    try {
      embed.setImage(config.welcome.gifUrl);
    } catch (_) {}
  }

  await interaction.reply({ embeds: [embed] });
}
