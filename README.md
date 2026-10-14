# 🎀 mini marilyn — Discord Bot ประจำเซิร์ฟเวอร์ "ดิสหมาๆ" 🐶

บอท Discord จัดการระบบต้อนรับสมาชิกใหม่ (Welcome System), ระบบแจกยศอัตโนมัติ (Auto-Role) และระบบแผงปุ่มกดยศ (Button Roles) พัฒนาด้วย **Node.js (discord.js v14)**

---

## 🚀 ฟีเจอร์หลัก (Features)

1. **👋 ระบบต้อนรับสมาชิกใหม่ (Welcome System):**
   - ส่งการ์ด Embed ต้อนรับพร้อมรูปโปรไฟล์, ลำดับสมาชิก และภาพ GIF เฉลิมฉลอง
   - ปรับแต่งข้อความต้อนรับและเลือกห้องส่งได้ตามใจชอบ
   - มีคำสั่งทดสอบการ์ด `/testwelcome` โดยไม่ต้องรอให้คนเข้าใหม่
2. **🛡️ ระบบแจกยศอัตโนมัติ (Auto-Role):**
   - แจกยศที่กำหนดทันทีเมื่อมีคนเข้าเซิร์ฟเวอร์ผ่าน `/setautorole`
3. **🎀 แผงปุ่มกดยศ / ยืนยันตัวตน (Button Roles / Verify Panel):**
   - สร้างกล่องข้อความพร้อมปุ่มกดรับยศเองได้ผ่าน `/rolepanel` (กดซ้ำเพื่อยกเลิกยศได้)
4. **📊 ข้อมูลเซิร์ฟเวอร์ & สมาชิก (Info Commands):**
   - `/serverinfo` ดูสถิติเซิร์ฟเวอร์ดิสหมาๆ
   - `/userinfo` ดูประวัติและยศของสมาชิก
   - `/announce` ประกาศข่าวสารแบบ Embed สวยงาม
   - `/ping` เช็คสถานะการออนไลน์ของบอท

---

## 🛠️ ขั้นตอนการตั้งค่าบอทให้ ออนไลน์ 100%

### ขั้นตอนที่ 1: รับ Bot Token จาก Discord Developer Portal
1. เข้าไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. กดปุ่ม **New Application** (หรือเลือก mini marilyn หากมีอยู่แล้ว)
3. ไปที่เมนู **Bot** ทางซ้ายมือ
4. กดปุ่ม **Reset Token** แล้วคัดลอก (Copy) โทเคนมาเก็บไว้
5. เลื่อนลงมาที่หัวข้อ **Privileged Gateway Intents** แล้ว **ติ๊กเปิด (ON)** ทั้ง 3 ช่อง:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT** *(สำคัญมากสำหรับระบบ Welcome และ Auto-Role)*
   - ✅ **MESSAGE CONTENT INTENT**
6. กด **Save Changes**

---

### ขั้นตอนที่ 2: เชิญบอทเข้าเซิร์ฟเวอร์ "ดิสหมาๆ"
1. ใน Developer Portal ไปที่เมนู **OAuth2** > **URL Generator**
2. ในช่อง **SCOPES** ให้ติ๊ก:
   - ✅ `bot`
   - ✅ `applications.commands`
3. ในช่อง **BOT PERMISSIONS** ให้ติ๊ก:
   - ✅ `Administrator` (หรือ Manage Roles, Send Messages, Embed Links)
4. เลื่อนลงมาล่างสุด Copy URL แล้วนำไปเปิดในเบราว์เซอร์เพื่อดึงบอทเข้าเซิร์ฟเวอร์ **ดิสหมาๆ**

> ⚠️ **ข้อควรระวังเรื่องลำดับยศ (Role Hierarchy):**
> เข้าไปที่ **Server Settings > Roles** ในดิสคอร์ด แล้วลากยศของ **mini marilyn** ให้อยู่ **สูงกว่า** ยศที่ต้องการให้บอทแจกอัตโนมัติ มิเช่นนั้น Discord จะไม่อนุญาตให้บอทแจกยศนั้นได้

---

### ขั้นตอนที่ 3: ใส่ Token ในโค้ด
1. เปิดไฟล์ `bot/.env`
2. วาง Token ลงในช่อง `DISCORD_TOKEN=...` ตัวอย่างเช่น:
```env
DISCORD_TOKEN=MTEyMzQ1Njc4OTA...
CLIENT_ID=
```

---

### ขั้นตอนที่ 4: เริ่มรันบอท (Start Bot)
เลือกวิธีใดวิธีหนึ่ง:
- **วิธีที่ 1 (ง่ายที่สุดบน Windows):** ดับเบิลคลิกไฟล์ `start-bot.bat` ที่โฟลเดอร์หลัก
- **วิธีที่ 2 (ผ่าน Terminal):**
```bash
npm run bot
```
เมื่อบอทขึ้นข้อความ `🎉 mini marilyn is now ONLINE!` บอทจะออนไลน์ในเซิร์ฟเวอร์ทันที พร้อมลงทะเบียนคำสั่ง Slash Commands ให้โดยอัตโนมัติ!

---

## 📖 สรุปคำสั่ง Slash Commands ทั้งหมด

| คำสั่ง | คำอธิบาย | ตัวอย่างการใช้งาน |
|---|---|---|
| `/setwelcome` | ตั้งค่าห้องและข้อความต้อนรับ | `/setwelcome channel:#ต้อนรับ message:ยินดีต้อนรับคุณ {user} สู่ {server}!` |
| `/testwelcome` | ดูตัวอย่างการ์ดต้อนรับ | `/testwelcome` |
| `/setautorole` | ตั้งค่ายศที่จะแจกอัตโนมัติ | `/setautorole role:@สมาชิก action:เพิ่มยศนี้` |
| `/rolepanel` | สร้างแผงปุ่มกดรับยศ | `/rolepanel role:@VIP title:กดรับยศ button_label:🎀 รับยศ` |
| `/serverinfo` | ดูข้อมูลดิสหมาๆ | `/serverinfo` |
| `/userinfo` | ดูข้อมูลผู้ใช้งาน | `/userinfo user:@สมาชิก` |
| `/announce` | ส่งประกาศแบบการ์ดสวยงาม | `/announce channel:#ประกาศ title:อัปเดตใหม่ message:มีกิจกรรม!` |
| `/ping` | เช็คปิงและความหน่วงของบอท | `/ping` |
| `/help` | เปิดดูคู่มือคำสั่งทั้งหมด | `/help` |
