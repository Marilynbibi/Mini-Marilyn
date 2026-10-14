import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('ดูรายการคำสั่งทั้งหมดของบอท mini marilyn');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#FFB6C1')
    .setTitle('✨ รายการคำสั่งของ mini marilyn ✨')
    .setDescription(`ยินดีต้อนรับสู่ระบบของ mini marilyn ประจำเซิร์ฟเวอร์ **${interaction.guild.name}** 🎀💖`)
    .addFields(
      {
        name: '📝 ระบบเขียนข้อความอิสระ (Custom Writing & Embeds)',
        value: '• `/write` - **เปิดหน้าต่างฟอร์มเขียนอะไรก็ได้ตามใจชอบ** (มีกล่องพิมพ์ข้อความยาวๆ ให้)\n• `/say` - ให้บอทส่งข้อความธรรมดาแทนเรา\n• `/embed` - ส่งการ์ดข้อความพร้อมรูปภาพ/GIF\n• `/editmessage` - แก้ไขข้อความเดิมของบอท'
      },
      {
        name: '👋 ระบบต้อนรับ & บอกลา (Welcome & Goodbye)',
        value: '• `/setwelcome` / `/editwelcome` / `/setwelcomegif` / `/testwelcome`\n• `/setgoodbye` / `/editgoodbye` / `/setgoodbyegif` / `/testgoodbye`'
      },
      {
        name: '🛡️ ระบบแจกยศ & ยืนยันตัวตน (Roles & Verify)',
        value: '• `/selfroles` (หรือ `/setroles`) - สร้างแผงเลือกยศทั่วไป (แจ้งเตือน/สถานะ/งานอดิเรก)\n• `/setgamerole` (หรือ `/gamepanel`) - สร้างแผงกดยศเกม (Game Roles)\n• `/setgender` - สร้างแผงปุ่มสำหรับเลือกเพศ (Gender Roles)\n• `/verify` - สร้างกล่อง "กดตรงนี้เพื่อรับยศ"\n• `/setautorole` - ตั้งค่ายศแจกอัตโนมัติเมื่อเข้าเซิร์ฟ'
      },
      {
        name: '🎫 ระบบตั๋วช่วยเหลือ (Ticket Support)',
        value: '• `/setticket` - สร้างแผงกดเปิดตั๋วติดต่อทีมงาน (Ticket Panel)\n• `/ticket close` - ปิดห้องตั๋วปัจจุบัน\n• `/ticket add` / `/ticket remove` - เพิ่มหรือนำสมาชิกเข้า/ออกห้อง\n• `/ticket rename` - เปลี่ยนชื่อห้องตั๋ว'
      },
      {
        name: '📊 ระบบสถิติเซิร์ฟเวอร์ (Server Stats)',
        value: '• `/serverstats setup` - ติดตั้งห้องสถิติจำนวนคน/บอทแบบเรียลไทม์\n• `/serverstats format` - ปรับแต่งชื่อ/อิโมจิตกแต่งห้องสถิติตามใจชอบ\n• `/serverstats update` - อัปเดตตัวเลขสถิติทันที\n• `/serverstats delete` - ลบห้องสถิติ'
      },
      {
        name: '💌 ช่องทางติดต่อ & ทั่วไป (Contacts & Info)',
        value: '• `/contact` / `/setcontact` - ข้อมูล TikTok, IG, itch.io\n• `/botstatus` - เปลี่ยนสถานะบอท\n• `/serverinfo` / `/userinfo` / `/ping`'
      }
    )
    .setFooter({ text: `mini marilyn • ${interaction.guild.name}`, iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
