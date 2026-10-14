import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setcontact')
  .setDescription('ตั้งค่าหรือเปลี่ยนลิงก์ช่องทางติดต่อ (TikTok, Instagram, itch.io)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('tiktok')
      .setDescription('ลิงก์ช่อง TikTok (เช่น https://tiktok.com/@yourname)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('instagram')
      .setDescription('ลิงก์ Instagram (เช่น https://instagram.com/yourname)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('itchio')
      .setDescription('ลิงก์ itch.io (เช่น https://yourname.itch.io)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const tiktok = interaction.options.getString('tiktok');
  const instagram = interaction.options.getString('instagram');
  const itchio = interaction.options.getString('itchio');

  if (!tiktok && !instagram && !itchio) {
    return interaction.reply({
      content: '❌ โปรดระบุลิงก์ที่ต้องการเปลี่ยนอย่างน้อย 1 ช่องทางนะคะ (TikTok, Instagram, หรือ itch.io)',
      ephemeral: true
    });
  }

  const config = getGuildConfig(interaction.guildId);
  config.socials = config.socials || {};

  if (tiktok) config.socials.tiktok = tiktok.trim();
  if (instagram) config.socials.instagram = instagram.trim();
  if (itchio) config.socials.itchio = itchio.trim();

  saveGuildConfig(interaction.guildId, config);

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('✅ บันทึกลิงก์ช่องทางติดต่อเรียบร้อยแล้ว!')
    .setDescription('mini marilyn จะใช้ลิงก์ต่อไปนี้ในคำสั่ง `/contact` ค่ะ')
    .addFields(
      { name: '🎵 TikTok', value: config.socials.tiktok || '*ยังไม่ได้ตั้ง*', inline: false },
      { name: '📸 Instagram', value: config.socials.instagram || '*ยังไม่ได้ตั้ง*', inline: false },
      { name: '🎮 itch.io', value: config.socials.itchio || '*ยังไม่ได้ตั้ง*', inline: false }
    )
    .setFooter({ text: 'พิมพ์ /contact เพื่อดูการ์ดแสดงผลจริงได้เลยค่ะ' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
