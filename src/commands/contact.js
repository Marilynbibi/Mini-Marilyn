import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('contact')
  .setDescription('แสดงช่องทางการติดต่อ (TikTok, Instagram, itch.io และอื่นๆ)')
  .addBooleanOption(option =>
    option.setName('send_to_channel')
      .setDescription('ต้องการส่งลงห้องแชทให้ทุกคนเห็นหรือไม่ (ถ้าไม่เลือกจะเห็นคนเดียว)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const sendToChannel = interaction.options.getBoolean('send_to_channel') ?? false;
  const config = getGuildConfig(interaction.guildId);

  const tiktokUrl = config.socials?.tiktok || 'https://www.tiktok.com';
  const igUrl = config.socials?.instagram || 'https://www.instagram.com';
  const itchioUrl = config.socials?.itchio || 'https://itch.io';

  const embed = new EmbedBuilder()
    .setColor('#FFB6C1')
    .setAuthor({
      name: `⋆. 🎀 Marilyn's Socials & Contacts ˚⋆`,
      iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
    })
    .setTitle('💌 ช่องทางการติดตามและติดต่อ (Official Links)')
    .setDescription(
      `สามารถติดตามผลงานเกม, คอนเทนต์, อัปเดตใหม่ๆ หรือติดต่องานได้ทางช่องทางด้านล่างนี้เลยค่ะ! 💕\n\n` +
      `🎵 **TikTok:** [คลิกเพื่อดู TikTok](${tiktokUrl})\n` +
      `📸 **Instagram:** [คลิกเพื่อดู Instagram](${igUrl})\n` +
      `🎮 **itch.io:** [คลิกเพื่อดูผลงานเกมบน itch.io](${itchioUrl})\n`
    )
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL())
    .setFooter({
      text: `${interaction.guild.name} • กดปุ่มด้านล่างเพื่อเปิดลิงก์ได้ทันที`,
      iconURL: interaction.client.user.displayAvatarURL()
    })
    .setTimestamp();

  // Create clickable Link Buttons
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('TikTok')
      .setEmoji('🎵')
      .setStyle(ButtonStyle.Link)
      .setURL(tiktokUrl),

    new ButtonBuilder()
      .setLabel('Instagram')
      .setEmoji('📸')
      .setStyle(ButtonStyle.Link)
      .setURL(igUrl),

    new ButtonBuilder()
      .setLabel('itch.io')
      .setEmoji('🎮')
      .setStyle(ButtonStyle.Link)
      .setURL(itchioUrl)
  );

  if (sendToChannel) {
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ ส่งการ์ดช่องทางติดต่อลงห้องแชทเรียบร้อยแล้วค่ะ!', ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
