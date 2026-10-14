import { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ChannelType, 
  EmbedBuilder 
} from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';
import { updateServerStats } from '../utils/serverStatsHelper.js';

export const data = new SlashCommandBuilder()
  .setName('serverstats')
  .setDescription('จัดการระบบแสดงสถิติสมาชิกเซิร์ฟเวอร์แบบ Realtime (ห้องล็อคแสดงจำนวนคน)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('setup')
      .setDescription('ติดตั้งหมวดหมู่และห้องแสดงสถิติสมาชิกอัตโนมัติ')
      .addStringOption(opt =>
        opt.setName('category_name')
          .setDescription('ชื่อหมวดหมู่ (ค่าเริ่มต้น: ◟ — SERVER STATS 📊)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('update')
      .setDescription('อัปเดตตัวเลขสถิติสมาชิกในห้องทันที')
  )
  .addSubcommand(sub =>
    sub.setName('format')
      .setDescription('ปรับแต่งชื่อหรือข้อความตกแต่งห้องสถิติ (ใช้ {count} แทนตัวเลข)')
      .addStringOption(opt =>
        opt.setName('all_members')
          .setDescription('รูปแบบชื่อห้องสมาชิกทั้งหมด เช่น: 🌸 All Members : {count}')
          .setRequired(false)
      )
      .addStringOption(opt =>
        opt.setName('members')
          .setDescription('รูปแบบชื่อห้องสมาชิก (คน) เช่น: 🍥 Members : {count}')
          .setRequired(false)
      )
      .addStringOption(opt =>
        opt.setName('bots')
          .setDescription('รูปแบบชื่อห้องบอท เช่น: 👘 Bots : {count}')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('delete')
      .setDescription('ลบห้องและปิดการใช้งานระบบสถิติสมาชิก')
  );

export async function execute(interaction) {
  await interaction.deferReply({ flags: 64 });

  const subcommand = interaction.options.getSubcommand();
  const guild = interaction.guild;
  const config = getGuildConfig(guild.id);

  // 1. /serverstats setup
  if (subcommand === 'setup') {
    const categoryName = interaction.options.getString('category_name') || '◟ — SERVER STATS 📊';

    try {
      // Fetch members
      await guild.members.fetch().catch(() => {});
      const totalCount = guild.memberCount || guild.members.cache.size;
      const botCount = guild.members.cache.filter(m => m.user.bot).size;
      const humanCount = Math.max(0, totalCount - botCount);

      // Create Category
      const category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        position: 0
      });

      // Permission Overwrites: Everyone can view, but CANNOT connect (Lock Icon 🔒)
      const lockedPermissions = [
        {
          id: guild.roles.everyone.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.Connect]
        },
        {
          id: guild.members.me.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect
          ]
        }
      ];

      // Create Voice Channels
      const allMembersCh = await guild.channels.create({
        name: `🌸 All Members : ${totalCount}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: lockedPermissions
      });

      const membersCh = await guild.channels.create({
        name: `🍥 Members : ${humanCount}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: lockedPermissions
      });

      const botsCh = await guild.channels.create({
        name: `👘 Bots : ${botCount}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: lockedPermissions
      });

      // Save Config
      config.serverStats = {
        enabled: true,
        categoryId: category.id,
        allMembersChannelId: allMembersCh.id,
        membersChannelId: membersCh.id,
        botsChannelId: botsCh.id,
        allMembersFormat: "🌸 All Members : {count}",
        membersFormat: "🍥 Members : {count}",
        botsFormat: "👘 Bots : {count}"
      };
      saveGuildConfig(guild.id, config);

      const embed = new EmbedBuilder()
        .setColor('#FFB6C1')
        .setTitle('📊 ติดตั้งระบบ Server Stats สำเร็จเรียบร้อย!')
        .setDescription(
          `สร้างห้องสถิติสมาชิกอัตโนมัติเรียบร้อยแล้วค่ะ โดยห้องจะล็อกไม่ให้กดเข้าไปคุยเพื่อแสดงเป็นตัวเลขสวยงาม 🎀\n\n` +
          `📁 **หมวดหมู่:** \`${categoryName}\`\n` +
          `• 🌸 **สมาชิกทั้งหมด:** \`${totalCount}\` คน\n` +
          `• 🍥 **สมาชิก (คน):** \`${humanCount}\` คน\n` +
          `• 👘 **บอทในเซิร์ฟเวอร์:** \`${botCount}\` ตัว\n\n` +
          `💡 *ตัวเลขจะอัปเดตอัตโนมัติเมื่อมีคนเข้าหรือออกจากเซิร์ฟเวอร์ค่ะ!*`
        )
        .setFooter({ text: 'mini marilyn • Server Stats 📊' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error setting up server stats:', error);
      return interaction.editReply({
        content: `❌ เกิดข้อผิดพลาดในการสร้างห้องสถิติ: ${error.message}\nโปรดตรวจสอบว่าบอทมีสิทธิ์ **Manage Channels (จัดการห้อง)** หรือไม่ค่ะ`
      });
    }
  }

  // 2. /serverstats update
  if (subcommand === 'update') {
    if (!config.serverStats?.enabled) {
      return interaction.editReply({
        content: '⚠️ เซิร์ฟเวอร์นี้ยังไม่ได้ติดตั้งระบบสถิติค่ะ โปรดพิมพ์ `/serverstats setup` เพื่อเริ่มใช้งานนะคะ'
      });
    }

    await updateServerStats(guild);
    return interaction.editReply({
      content: '✅ อัปเดตตัวเลขสถิติสมาชิกในห้องเรียบร้อยแล้วค่ะ! 📊✨'
    });
  }

  // 3. /serverstats format
  if (subcommand === 'format') {
    if (!config.serverStats?.enabled) {
      return interaction.editReply({
        content: '⚠️ เซิร์ฟเวอร์นี้ยังไม่ได้ติดตั้งระบบสถิติค่ะ โปรดพิมพ์ `/serverstats setup` เพื่อเริ่มใช้งานนะคะ'
      });
    }

    const allMembersFmt = interaction.options.getString('all_members');
    const membersFmt = interaction.options.getString('members');
    const botsFmt = interaction.options.getString('bots');

    if (!allMembersFmt && !membersFmt && !botsFmt) {
      return interaction.editReply({
        content: '⚠️ กรุณาระบุรูปแบบชื่อห้องที่ต้องการเปลี่ยนอย่างน้อย 1 ห้องค่ะ (โดยสามารถใส่ `{count}` เพื่อแสดงตัวเลขสถิติ)'
      });
    }

    if (allMembersFmt) config.serverStats.allMembersFormat = allMembersFmt.includes('{count}') ? allMembersFmt : `${allMembersFmt} {count}`;
    if (membersFmt) config.serverStats.membersFormat = membersFmt.includes('{count}') ? membersFmt : `${membersFmt} {count}`;
    if (botsFmt) config.serverStats.botsFormat = botsFmt.includes('{count}') ? botsFmt : `${botsFmt} {count}`;

    saveGuildConfig(guild.id, config);
    await updateServerStats(guild);

    const embed = new EmbedBuilder()
      .setColor('#FFB6C1')
      .setTitle('🎨 ปรับแต่งรูปแบบชื่อห้อง Server Stats สำเร็จ!')
      .setDescription('บอทจะใช้รูปแบบชื่อและของตกแต่งนี้ตลอดไป โดยจะไม่แก้กลับเป็นค่าเริ่มต้นค่ะ 💖\n*(หากต้องการเปลี่ยนชื่อหรือตกแต่ง สามารถคลิกแก้ไขชื่อห้องใน Discord หรือใช้คำสั่งนี้ได้ตลอดเวลา)*')
      .addFields(
        { name: '🌸 สมาชิกทั้งหมด', value: `\`${config.serverStats.allMembersFormat}\``, inline: true },
        { name: '🍥 สมาชิก (คน)', value: `\`${config.serverStats.membersFormat}\``, inline: true },
        { name: '👘 บอท', value: `\`${config.serverStats.botsFormat}\``, inline: true }
      )
      .setFooter({ text: 'mini marilyn • Server Stats 📊' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }

  // 4. /serverstats delete
  if (subcommand === 'delete') {
    if (!config.serverStats?.enabled) {
      return interaction.editReply({
        content: '⚠️ เซิร์ฟเวอร์นี้ไม่มีระบบสถิติที่เปิดใช้งานอยู่ค่ะ'
      });
    }

    try {
      const stats = config.serverStats;
      if (stats.allMembersChannelId) await guild.channels.cache.get(stats.allMembersChannelId)?.delete().catch(() => {});
      if (stats.membersChannelId) await guild.channels.cache.get(stats.membersChannelId)?.delete().catch(() => {});
      if (stats.botsChannelId) await guild.channels.cache.get(stats.botsChannelId)?.delete().catch(() => {});
      if (stats.categoryId) await guild.channels.cache.get(stats.categoryId)?.delete().catch(() => {});

      config.serverStats = {
        enabled: false,
        categoryId: null,
        allMembersChannelId: null,
        membersChannelId: null,
        botsChannelId: null
      };
      saveGuildConfig(guild.id, config);

      return interaction.editReply({
        content: '🗑️ ลบห้องและปิดระบบสถิติสมาชิกเรียบร้อยแล้วค่ะ!'
      });
    } catch (error) {
      console.error('Error deleting server stats:', error);
      return interaction.editReply({
        content: `❌ เกิดข้อผิดพลาดในการลบ: ${error.message}`
      });
    }
  }
}
