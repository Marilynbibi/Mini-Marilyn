import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const data = new SlashCommandBuilder()
  .setName('setautorole')
  .setDescription('ตั้งค่ายศที่จะแจกอัตโนมัติเมื่อมีสมาชิกใหม่เข้าเซิร์ฟเวอร์ (Auto-Role)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption(option =>
    option.setName('role')
      .setDescription('เลือกยศที่ต้องการแจกอัตโนมัติ')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('action')
      .setDescription('เลือกการกระทำ')
      .setRequired(true)
      .addChoices(
        { name: '➕ เพิ่มยศนี้เข้าระบบ Auto-Role', value: 'add' },
        { name: '➖ ลบยศนี้ออกจากระบบ Auto-Role', value: 'remove' }
      )
  );

export async function execute(interaction) {
  const role = interaction.options.getRole('role');
  const action = interaction.options.getString('action');

  const botMember = interaction.guild.members.me;
  if (role.position >= botMember.roles.highest.position) {
    return interaction.reply({
      content: `❌ ไม่สามารถจัดการยศ **${role.name}** ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท mini marilyn\nโปรดลากยศของบอทให้อยู่สูงกว่ายศที่ต้องการแจกใน Server Settings > Roles นะคะ`,
      ephemeral: true
    });
  }

  const config = getGuildConfig(interaction.guildId);
  config.autoRole = config.autoRole || { enabled: true, roleIds: [] };

  if (action === 'add') {
    if (!config.autoRole.roleIds.includes(role.id)) {
      config.autoRole.roleIds.push(role.id);
    }
  } else if (action === 'remove') {
    config.autoRole.roleIds = config.autoRole.roleIds.filter(id => id !== role.id);
  }

  saveGuildConfig(interaction.guildId, config);

  const activeRoles = config.autoRole.roleIds.length > 0
    ? config.autoRole.roleIds.map(id => `<@&${id}>`).join(', ')
    : '*ยังไม่มีการตั้งค่ายศ*';

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('🛡️ บันทึกการตั้งค่า Auto-Role เรียบร้อยแล้ว')
    .setDescription(
      action === 'add'
        ? `✅ เพิ่มยศ <@&${role.id}> เข้าสู่ระบบ Auto-Role ในเซิร์ฟเวอร์ **${interaction.guild.name}** แล้ว!`
        : `🗑️ ลบยศ <@&${role.id}> ออกจากระบบ Auto-Role ในเซิร์ฟเวอร์ **${interaction.guild.name}** แล้ว!`
    )
    .addFields(
      { name: '📋 รายการยศที่จะแจกอัตโนมัติเมื่อมีคนเข้าเซิร์ฟทั้งหมด:', value: activeRoles }
    )
    .setFooter({ text: `mini marilyn • Auto-Role System • ${interaction.guild.name}` });

  await interaction.reply({ embeds: [embed] });
}
