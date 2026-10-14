import { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('คำสั่งจัดการห้อง Ticket')
  .addSubcommand(sub =>
    sub.setName('close')
      .setDescription('ปิดห้อง Ticket นี้')
  )
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('เพิ่มสมาชิกเข้ามาร่วมในห้อง Ticket นี้')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('สมาชิกที่ต้องการเพิ่มเข้ามา')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('นำสมาชิกออกจากห้อง Ticket นี้')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('สมาชิกที่ต้องการนำออก')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('rename')
      .setDescription('เปลี่ยนชื่อห้อง Ticket นี้')
      .addStringOption(opt =>
        opt.setName('name')
          .setDescription('ชื่อห้องใหม่')
          .setRequired(true)
      )
  );

export async function execute(interaction) {
  const channel = interaction.channel;
  const subcommand = interaction.options.getSubcommand();

  // Check if channel is a ticket channel
  const isTicket = channel.name.startsWith('ticket-') || (channel.topic && channel.topic.includes('Ticket ของ'));
  if (!isTicket) {
    return interaction.reply({
      content: '❌ คำสั่งนี้สามารถใช้งานได้เฉพาะภายในห้อง Ticket เท่านั้นค่ะ',
      flags: 64
    });
  }

  // 1. /ticket close
  if (subcommand === 'close') {
    const embed = new EmbedBuilder()
      .setColor('#FFA07A')
      .setTitle('🔒 ยืนยันการปิด Ticket')
      .setDescription('คุณต้องการปิดห้อง Ticket นี้ใช่หรือไม่คะ?\nหากยืนยัน สมาชิกจะไม่สามารถส่งข้อความได้ และสามารถเลือกลบห้องได้ค่ะ')
      .setFooter({ text: `ดำเนินการโดย ${interaction.user.tag}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_ticket_confirm_close')
        .setLabel('ยืนยันปิด Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('btn_ticket_cancel_close')
        .setLabel('ยกเลิก')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // 2. /ticket add
  if (subcommand === 'add') {
    const targetUser = interaction.options.getUser('user');

    try {
      await channel.permissionOverwrites.edit(targetUser.id, {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true,
        EmbedLinks: true,
        ReadMessageHistory: true
      });

      const embed = new EmbedBuilder()
        .setColor('#98FB98')
        .setDescription(`✅ เพิ่มคุณ <@${targetUser.id}> เข้าสู่ห้อง Ticket เรียบร้อยแล้วค่ะ!`);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return interaction.reply({
        content: `❌ เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ${error.message}`,
        flags: 64
      });
    }
  }

  // 3. /ticket remove
  if (subcommand === 'remove') {
    const targetUser = interaction.options.getUser('user');

    try {
      await channel.permissionOverwrites.delete(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor('#FFA07A')
        .setDescription(`➖ นำคุณ <@${targetUser.id}> ออกจากห้อง Ticket เรียบร้อยแล้วค่ะ`);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return interaction.reply({
        content: `❌ เกิดข้อผิดพลาดในการนำสมาชิกออก: ${error.message}`,
        flags: 64
      });
    }
  }

  // 4. /ticket rename
  if (subcommand === 'rename') {
    const newName = interaction.options.getString('name').trim().toLowerCase().replace(/\s+/g, '-');

    try {
      const formattedName = newName.startsWith('ticket-') ? newName : `ticket-${newName}`;
      await channel.setName(formattedName);

      return interaction.reply({
        content: `✏️ เปลี่ยนชื่อห้อง Ticket เป็น **#${formattedName}** เรียบร้อยแล้วค่ะ!`
      });
    } catch (error) {
      return interaction.reply({
        content: `❌ เกิดข้อผิดพลาดในการเปลี่ยนชื่อห้อง: ${error.message}`,
        flags: 64
      });
    }
  }
}
