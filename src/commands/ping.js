import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('เช็คสถานะและความหน่วง (Latency) ของบอท mini marilyn');

export async function execute(interaction) {
  const sent = await interaction.reply({
    content: '🏓 กำลังคำนวณปิง...',
    fetchReply: true
  });

  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiLatency = Math.round(interaction.client.ws.ping);

  const embed = new EmbedBuilder()
    .setColor('#FFB6C1')
    .setTitle('🎀 สถานะของ mini marilyn')
    .setDescription('บอทออนไลน์และพร้อมทำงานเรียบร้อยแล้วค่ะ!')
    .addFields(
      { name: '⚡ Bot Latency', value: `\`${latency} ms\``, inline: true },
      { name: '🌐 API Latency', value: `\`${apiLatency} ms\``, inline: true },
      { name: '🐶 Server', value: `${interaction.guild.name}`, inline: true }
    )
    .setFooter({ text: 'mini marilyn • ดิสหมาๆ', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.editReply({ content: null, embeds: [embed] });
}
