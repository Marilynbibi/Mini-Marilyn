import { SlashCommandBuilder, PermissionFlagsBits, ActivityType, EmbedBuilder } from 'discord.js';
import { loadAllConfig, saveAllConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('botstatus')
  .setDescription('เปลี่ยนข้อความสถานะ (Status / Presence) ของบอท mini marilyn')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('text')
      .setDescription('ข้อความสถานะที่ต้องการให้บอทแสดง (เช่น ⋆. 🎀 Marilyn ˚⋆ | /help)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('type')
      .setDescription('ประเภทกิจกรรม')
      .setRequired(false)
      .addChoices(
        { name: 'Custom (ข้อความกำหนดเอง)', value: 'Custom' },
        { name: 'Playing (กำลังเล่น...)', value: 'Playing' },
        { name: 'Watching (กำลังดู...)', value: 'Watching' },
        { name: 'Listening (กำลังฟัง...)', value: 'Listening' },
        { name: 'Competing (กำลังแข่ง...)', value: 'Competing' }
      )
  );

export async function execute(interaction) {
  const text = interaction.options.getString('text');
  const typeStr = interaction.options.getString('type') || 'Custom';

  let activityType = ActivityType.Custom;
  if (typeStr === 'Playing') activityType = ActivityType.Playing;
  else if (typeStr === 'Watching') activityType = ActivityType.Watching;
  else if (typeStr === 'Listening') activityType = ActivityType.Listening;
  else if (typeStr === 'Competing') activityType = ActivityType.Competing;

  interaction.client.user.setPresence({
    activities: [
      {
        name: text,
        type: activityType
      }
    ],
    status: 'online'
  });

  // Save to config so it persists
  const all = loadAllConfig();
  all.botStatus = { text, type: typeStr };
  saveAllConfig(all);

  const embed = new EmbedBuilder()
    .setColor('#FFB6C1')
    .setTitle('✨ เปลี่ยนสถานะของ mini marilyn สำเร็จแล้ว!')
    .setDescription(`สถานะใหม่ของบอทคือ:\n**"${text}"**`)
    .setFooter({ text: 'mini marilyn • Status Updated' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
