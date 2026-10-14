import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { loadConfig, saveConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('rolepanel')
  .setDescription('สร้างแผงปุ่มสำหรับกดรับยศเอง (Button Role / Verification Panel)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption(option =>
    option.setName('role')
      .setDescription('เลือกยศที่สมาชิกจะได้รับเมื่อกดปุ่ม')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('หัวข้อของการ์ด (เช่น: ยืนยันตัวตน / รับยศสมาชิก)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('description')
      .setDescription('คำอธิบายในแผงข้อความ')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('button_label')
      .setDescription('ข้อความบนปุ่ม (เช่น: 🐶 กดเพื่อรับยศ / Verify)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const role = interaction.options.getRole('role');
  const title = interaction.options.getString('title') || '✨ รับยศสมาชิก / Self Roles';
  const description = interaction.options.getString('description') || `กดปุ่มด้านล่างเพื่อรับหรือลบยศ **${role.name}** เข้าสู่โปรไฟล์ของคุณค่ะ!`;
  const buttonLabel = interaction.options.getString('button_label') || `รับยศ ${role.name}`;

  // Check bot role hierarchy
  const botMember = interaction.guild.members.me;
  if (role.position >= botMember.roles.highest.position) {
    return interaction.reply({
      content: `❌ ไม่สามารถสร้างแผงยศสำหรับ **${role.name}** ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท mini marilyn\nโปรดลากยศของบอทให้อยู่เหนือยศดังกล่าวใน Server Settings > Roles นะคะ`,
      ephemeral: true
    });
  }

  const customId = `btn_role_${role.id}`;

  // Store in config
  const config = loadConfig();
  config.buttonRoles = config.buttonRoles || {};
  config.buttonRoles[customId] = {
    roleId: role.id,
    roleName: role.name
  };
  saveConfig(config);

  const embed = new EmbedBuilder()
    .setColor('#FFB6C1')
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { name: '🏷️ ยศที่จะได้รับ:', value: `<@&${role.id}>` }
    )
    .setFooter({ text: 'mini marilyn • ระบบกดยศอัตโนมัติ', iconURL: interaction.client.user.displayAvatarURL() });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(buttonLabel)
      .setEmoji('🎀')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: `✅ สร้างแผงกดยศสำหรับ <@&${role.id}> เรียบร้อยแล้ว!`, ephemeral: true });
}
