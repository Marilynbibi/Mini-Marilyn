import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionFlagsBits 
} from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../utils/storage.js';

export const name = 'interactionCreate';

export async function execute(interaction) {
  // 1. Handle Slash Commands & Context Menu Commands
  if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      const replyPayload = {
        content: '❌ เกิดข้อผิดพลาดในการประมวลผลคำสั่งนี้ โปรดลองใหม่อีกครั้ง!',
        flags: 64
      };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyPayload);
        } else {
          await interaction.reply(replyPayload);
        }
      } catch (_) {}
    }
  }

  // 2. Handle Modal Submissions
  else if (interaction.isModalSubmit()) {
    // 2.1 From /write command
    if (interaction.customId === 'modal_write_embed') {
      try {
        await interaction.deferReply({ flags: 64 }).catch(() => {});

        const title = interaction.fields.getTextInputValue('write_title');
        const content = interaction.fields.getTextInputValue('write_content');
        const color = interaction.fields.getTextInputValue('write_color') || '#FFB6C1';
        const image = interaction.fields.getTextInputValue('write_image');

        const embed = new EmbedBuilder()
          .setColor(color.startsWith('#') ? color : '#FFB6C1')
          .setDescription(content)
          .setFooter({
            text: `${interaction.guild.name} • โพสต์โดย ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        if (title && title.trim().length > 0) {
          embed.setTitle(title.trim());
        }

        if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
          try {
            embed.setImage(image.trim());
          } catch (_) {}
        }

        await interaction.channel.send({ embeds: [embed] });
        await interaction.editReply({
          content: '✅ โพสต์ข้อความการ์ดของคุณเรียบร้อยแล้วค่ะ!'
        }).catch(() => {});
      } catch (error) {
        console.error('Error handling modal write embed:', error);
      }
    }

    // 2.2 From Right-Click Edit Message (modal_edit_msg_...)
    else if (interaction.customId.startsWith('modal_edit_msg_')) {
      try {
        await interaction.deferReply({ flags: 64 }).catch(() => {});

        const parts = interaction.customId.split('_');
        const channelId = parts[3];
        const messageId = parts[4];

        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
        if (!channel) {
          return interaction.editReply({ content: '❌ ไม่พบห้องข้อความดังกล่าวค่ะ' }).catch(() => {});
        }

        const targetMessage = await channel.messages.fetch(messageId).catch(() => null);
        if (!targetMessage) {
          return interaction.editReply({ content: '❌ ไม่พบข้อความที่ต้องการแก้ไขค่ะ' }).catch(() => {});
        }

        const newTitle = interaction.fields.getTextInputValue('edit_title');
        const newContent = interaction.fields.getTextInputValue('edit_content');
        const newImage = interaction.fields.getTextInputValue('edit_image');

        if (targetMessage.embeds.length > 0) {
          const oldEmbed = targetMessage.embeds[0];
          const newEmbed = EmbedBuilder.from(oldEmbed)
            .setDescription(newContent);

          if (newTitle && newTitle.trim().length > 0) {
            newEmbed.setTitle(newTitle.trim());
          }

          if (newImage && (newImage.startsWith('http://') || newImage.startsWith('https://'))) {
            newEmbed.setImage(newImage.trim());
          }

          await targetMessage.edit({ embeds: [newEmbed] });
        } else {
          await targetMessage.edit({ content: newContent });
        }

        await interaction.editReply({
          content: '✨ แก้ไขข้อความในห้องแชทเรียบร้อยแล้วค่ะ โดยไม่ต้องลบทำใหม่! 🎉'
        }).catch(() => {});
      } catch (error) {
        console.error('Error editing message from modal:', error);
        await interaction.editReply({
          content: `❌ เกิดข้อผิดพลาดในการแก้ไข: ${error.message}`
        }).catch(() => {});
      }
    }
  }

  // 3. Handle Button Interactions
  else if (interaction.isButton()) {
    const customId = interaction.customId;

    // 3.1 Self Role Buttons
    if (customId.startsWith('btn_role_')) {
      const roleId = customId.replace('btn_role_', '');
      const member = interaction.member;
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return interaction.reply({
          content: '❌ ไม่พบยศนี้ในเซิร์ฟเวอร์ (อาจถูกลบไปแล้ว)',
          flags: 64
        }).catch(() => {});
      }

      const botMember = interaction.guild.members.me;
      if (role.position >= botMember.roles.highest.position) {
        return interaction.reply({
          content: '❌ บอทไม่สามารถจัดการยศนี้ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท',
          flags: 64
        }).catch(() => {});
      }

      try {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(role);
          await interaction.reply({
            content: `➖ ลบยศ **${role.name}** ออกจากโปรไฟล์ของคุณเรียบร้อยแล้วค่ะ`,
            flags: 64
          }).catch(() => {});
        } else {
          await member.roles.add(role);
          await interaction.reply({
            content: `✅ ได้รับยศ **${role.name}** เรียบร้อยแล้วค่ะ! 🎉`,
            flags: 64
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Error toggling button role:', error);
        await interaction.reply({
          content: '❌ เกิดข้อผิดพลาดในการให้ยศ โปรดแจ้งผู้ดูแลเซิร์ฟเวอร์',
          flags: 64
        }).catch(() => {});
      }
    }

    // 3.1.2 Gender Role Buttons
    else if (customId.startsWith('btn_gender_')) {
      const roleId = customId.replace('btn_gender_', '');
      const member = interaction.member;
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return interaction.reply({
          content: '❌ ไม่พบยศนี้ในเซิร์ฟเวอร์ (อาจถูกลบไปแล้ว)',
          flags: 64
        }).catch(() => {});
      }

      const botMember = interaction.guild.members.me;
      if (role.position >= botMember.roles.highest.position) {
        return interaction.reply({
          content: '❌ บอทไม่สามารถจัดการยศนี้ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท โปรดแจ้งแอดมินนะคะ',
          flags: 64
        }).catch(() => {});
      }

      try {
        const config = getGuildConfig(interaction.guildId);
        const isExclusive = config.gender?.exclusive ?? true;

        if (member.roles.cache.has(roleId)) {
          // If already has this gender role, toggle off
          await member.roles.remove(role);
          await interaction.reply({
            content: `➖ ยกเลิกยศ **${role.name}** ออกจากโปรไฟล์ของคุณเรียบร้อยแล้วค่ะ`,
            flags: 64
          }).catch(() => {});
        } else {
          // If exclusive, remove other configured gender roles first
          if (isExclusive && config.gender) {
            const allGenderRoleIds = [
              config.gender.maleRoleId,
              config.gender.femaleRoleId,
              config.gender.otherRoleId
            ].filter(id => id && id !== roleId);

            for (const otherId of allGenderRoleIds) {
              if (member.roles.cache.has(otherId)) {
                await member.roles.remove(otherId).catch(() => {});
              }
            }
          }

          // Add selected gender role
          await member.roles.add(role);
          await interaction.reply({
            content: `✅ คุณได้เลือกยศ **${role.name}** เรียบร้อยแล้วค่ะ! 💖${isExclusive ? ' *(สลับยศเพศให้อัตโนมัติ)*' : ''}`,
            flags: 64
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Error selecting gender role:', error);
        await interaction.reply({
          content: '❌ เกิดข้อผิดพลาดในการจัดการยศ โปรดแจ้งผู้ดูแลเซิร์ฟเวอร์',
          flags: 64
        }).catch(() => {});
      }
    }

    // 3.1.3 Game Role Buttons
    else if (customId.startsWith('btn_game_')) {
      const roleId = customId.replace('btn_game_', '');
      const member = interaction.member;
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return interaction.reply({
          content: '❌ ไม่พบยศนี้ในเซิร์ฟเวอร์ (อาจถูกลบไปแล้ว)',
          flags: 64
        }).catch(() => {});
      }

      const botMember = interaction.guild.members.me;
      if (role.position >= botMember.roles.highest.position) {
        return interaction.reply({
          content: '❌ บอทไม่สามารถจัดการยศนี้ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท โปรดแจ้งแอดมินนะคะ',
          flags: 64
        }).catch(() => {});
      }

      try {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(role);
          await interaction.reply({
            content: `➖ ถอดยศเกม **${role.name}** ออกจากโปรไฟล์แล้วค่ะ 🎮`,
            flags: 64
          }).catch(() => {});
        } else {
          await member.roles.add(role);
          await interaction.reply({
            content: `✅ ได้รับยศเกม **${role.name}** เรียบร้อยแล้วค่ะ! ขอให้สนุกกับการเล่นเกมนะคะ 🎮✨`,
            flags: 64
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Error toggling game role:', error);
        await interaction.reply({
          content: '❌ เกิดข้อผิดพลาดในการจัดการยศ โปรดแจ้งผู้ดูแลเซิร์ฟเวอร์',
          flags: 64
        }).catch(() => {});
      }
    }

    // 3.2 Ticket System: Open Ticket
    else if (customId === 'btn_ticket_open') {
      try {
        await interaction.deferReply({ flags: 64 });

        const guild = interaction.guild;
        const user = interaction.user;
        const config = getGuildConfig(guild.id);

        // Check if user already has an active ticket
        const existingChannel = guild.channels.cache.find(c =>
          c.type === ChannelType.GuildText &&
          c.topic &&
          c.topic.includes(user.id)
        );

        if (existingChannel) {
          return interaction.editReply({
            content: `⚠️ คุณมีห้อง Ticket ที่เปิดอยู่แล้วที่นี่ค่ะ: <#${existingChannel.id}>\nโปรดติดต่อเรื่องต่างๆ ในห้องดังกล่าวนะคะ`
          });
        }

        // Clean username for channel name
        const cleanName = user.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 15) || user.id.slice(-4);
        const channelName = `ticket-${cleanName}`;

        // Set permission overwrites
        const permissionOverwrites = [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: guild.members.me.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
        ];

        // If support role is configured, give them access
        if (config.ticket?.supportRoleId) {
          const supportRole = guild.roles.cache.get(config.ticket.supportRoleId);
          if (supportRole) {
            permissionOverwrites.push({
              id: supportRole.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ReadMessageHistory
              ]
            });
          }
        }

        // Find or create category at the bottom of the server
        let targetCategory = config.ticket?.categoryId ? guild.channels.cache.get(config.ticket.categoryId) : null;

        if (!targetCategory) {
          // Look for an existing category named with 'ticket' or '🎫'
          targetCategory = guild.channels.cache.find(c => 
            c.type === ChannelType.GuildCategory && 
            (c.name.toLowerCase().includes('ticket') || c.name.includes('🎫'))
          );

          // If none found, automatically create a dedicated category at the bottom
          if (!targetCategory) {
            try {
              targetCategory = await guild.channels.create({
                name: '◟ — TICKETS 🎫',
                type: ChannelType.GuildCategory,
                position: 99
              });
              config.ticket = config.ticket || {};
              config.ticket.categoryId = targetCategory.id;
              saveGuildConfig(guild.id, config);
            } catch (err) {
              console.warn('[Ticket] Could not auto-create tickets category:', err.message);
            }
          } else {
            config.ticket = config.ticket || {};
            config.ticket.categoryId = targetCategory.id;
            saveGuildConfig(guild.id, config);
          }
        }

        const ticketChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: targetCategory ? targetCategory.id : null,
          position: targetCategory ? undefined : guild.channels.cache.size,
          topic: `🎟️ Ticket สำหรับ <@${user.id}> (${user.id}) | mini marilyn`,
          permissionOverwrites
        });

        // Send Initial Embed in Ticket Channel
        const welcomeEmbed = new EmbedBuilder()
          .setColor('#FFB6C1')
          .setTitle('🎫 ยินดีต้อนรับสู่ห้องตั๋วช่วยเหลือ (Support Ticket)')
          .setDescription(`สวัสดีค่ะคุณ <@${user.id}> 💖\n\nโปรดพิมพ์แจ้งปัญหา คำถาม หรือสิ่งที่ต้องการให้ช่วยเหลือไว้ในห้องนี้ได้เลยนะคะ\nทีมงานจะเข้ามาตอบกลับและดูแลโดยเร็วที่สุดค่ะ 🎀`)
          .addFields(
            { name: '👤 เจ้าของ Ticket', value: `<@${user.id}> (${user.tag})`, inline: true },
            { name: '🕒 เวลาที่เปิด', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
          )
          .setFooter({
            text: `mini marilyn • Ticket System`,
            iconURL: interaction.client.user.displayAvatarURL()
          })
          .setTimestamp();

        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('btn_ticket_close')
            .setLabel('🔒 ปิด Ticket')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('btn_ticket_claim')
            .setLabel('🙋‍♀️ รับเคส (Claim)')
            .setStyle(ButtonStyle.Success)
        );

        const pingMessage = config.ticket?.supportRoleId
          ? `<@${user.id}> | <@&${config.ticket.supportRoleId}>`
          : `<@${user.id}>`;

        await ticketChannel.send({
          content: pingMessage,
          embeds: [welcomeEmbed],
          components: [actionRow]
        });

        await interaction.editReply({
          content: `✅ เปิดห้อง Ticket ให้เรียบร้อยแล้วค่ะ! ➔ <#${ticketChannel.id}>`
        });
      } catch (error) {
        console.error('Error opening ticket:', error);
        await interaction.editReply({
          content: `❌ เกิดข้อผิดพลาดในการเปิด Ticket: ${error.message}`
        }).catch(() => {});
      }
    }

    // 3.3 Ticket System: Close Request (Prompt Confirm)
    else if (customId === 'btn_ticket_close') {
      const confirmEmbed = new EmbedBuilder()
        .setColor('#FFA07A')
        .setTitle('🔒 ยืนยันการปิด Ticket')
        .setDescription('คุณต้องการปิดห้อง Ticket นี้ใช่หรือไม่คะ?\nเมื่อปิดแล้ว สมาชิกจะไม่สามารถส่งข้อความได้อีก และสามารถเลือกลบห้องได้ค่ะ');

      const confirmRow = new ActionRowBuilder().addComponents(
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

      await interaction.reply({
        embeds: [confirmEmbed],
        components: [confirmRow]
      });
    }

    // 3.4 Ticket System: Confirm Close
    else if (customId === 'btn_ticket_confirm_close') {
      try {
        const channel = interaction.channel;
        const topic = channel.topic || '';
        const match = topic.match(/\d{17,20}/);

        if (match) {
          const ownerId = match[0];
          await channel.permissionOverwrites.edit(ownerId, {
            SendMessages: false
          }).catch(() => {});
        }

        const closedEmbed = new EmbedBuilder()
          .setColor('#FF69B4')
          .setTitle('🔒 Ticket ถูกปิดเรียบร้อยแล้ว')
          .setDescription(`ห้อง Ticket นี้ถูกปิดโดย <@${interaction.user.id}>\nหากดำเนินการเสร็จสิ้นแล้ว สามารถกดปุ่ม **"🗑️ ลบห้อง Ticket"** ด้านล่างเพื่อลบห้องได้เลยค่ะ`)
          .setTimestamp();

        const deleteRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('btn_ticket_delete')
            .setLabel('🗑️ ลบห้อง Ticket')
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.update({
          embeds: [closedEmbed],
          components: [deleteRow]
        });
      } catch (error) {
        console.error('Error confirming ticket close:', error);
        await interaction.reply({
          content: `❌ เกิดข้อผิดพลาด: ${error.message}`,
          flags: 64
        }).catch(() => {});
      }
    }

    // 3.5 Ticket System: Cancel Close
    else if (customId === 'btn_ticket_cancel_close') {
      await interaction.message.delete().catch(() => {});
    }

    // 3.6 Ticket System: Delete Ticket Channel
    else if (customId === 'btn_ticket_delete') {
      const config = getGuildConfig(interaction.guildId);
      const isOwner = interaction.guild.ownerId === interaction.user.id;
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      const isSupportRole = config.ticket?.supportRoleId && interaction.member.roles.cache.has(config.ticket.supportRoleId);

      if (!isOwner && !isAdmin && !isSupportRole) {
        return interaction.reply({
          content: '❌ เฉพาะแอดมินหรือทีมงานเท่านั้นที่สามารถลบห้อง Ticket ได้ค่ะ',
          flags: 64
        }).catch(() => {});
      }

      await interaction.reply({
        content: '⏳ กำลังลบห้อง Ticket นี้ใน 5 วินาทีค่ะ...'
      });

      setTimeout(async () => {
        try {
          await interaction.channel.delete();
        } catch (error) {
          console.error('Error deleting ticket channel:', error);
        }
      }, 5000);
    }

    // 3.7 Ticket System: Claim Ticket (Admin / Highest Role Only)
    else if (customId === 'btn_ticket_claim') {
      const config = getGuildConfig(interaction.guildId);
      const isOwner = interaction.guild.ownerId === interaction.user.id;
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      const isSupportRole = config.ticket?.supportRoleId && interaction.member.roles.cache.has(config.ticket.supportRoleId);

      // Check if user has high role / Administrator permission / Support Role
      if (!isOwner && !isAdmin && !isSupportRole) {
        return interaction.reply({
          content: '❌ เฉพาะแอดมิน / ยศสูงสุด หรือทีมงานเท่านั้นที่สามารถกดรับเคสได้ค่ะ ⚠️',
          flags: 64
        }).catch(() => {});
      }

      const claimEmbed = new EmbedBuilder()
        .setColor('#98FB98')
        .setDescription(`🙋‍♀️ <@${interaction.user.id}> ได้รับเรื่องและเป็นผู้ดูแลเคสนี้แล้วค่ะ! 💖`);

      // Disable claim button
      const oldRows = interaction.message.components;
      const updatedRows = oldRows.map(row => {
        const newRow = new ActionRowBuilder();
        row.components.forEach(comp => {
          if (comp.customId === 'btn_ticket_claim') {
            newRow.addComponents(
              ButtonBuilder.from(comp)
                .setDisabled(true)
                .setLabel(`รับเคสโดย ${interaction.user.displayName || interaction.user.username}`)
            );
          } else {
            newRow.addComponents(ButtonBuilder.from(comp));
          }
        });
        return newRow;
      });

      await interaction.update({ components: updatedRows });
      await interaction.channel.send({ embeds: [claimEmbed] });
    }
  }

  // 4. Handle String Select Menu Interactions
  else if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;

    if (customId === 'select_game_roles' || customId === 'select_self_roles') {
      const isGame = customId === 'select_game_roles';
      const member = interaction.member;
      const botMember = interaction.guild.members.me;
      const selectedRoleIds = interaction.values;

      // Extract all options present in this menu
      const menuComponent = interaction.message.components
        .flatMap(row => row.components)
        .find(comp => comp.customId === customId);

      const allOptionRoleIds = menuComponent ? menuComponent.options.map(opt => opt.value) : selectedRoleIds;

      try {
        let addedRoles = [];
        let removedRoles = [];

        for (const roleId of allOptionRoleIds) {
          const role = interaction.guild.roles.cache.get(roleId);
          if (!role || role.position >= botMember.roles.highest.position) continue;

          if (selectedRoleIds.includes(roleId)) {
            if (!member.roles.cache.has(roleId)) {
              await member.roles.add(role).catch(() => {});
              addedRoles.push(role.name);
            }
          } else {
            if (member.roles.cache.has(roleId)) {
              await member.roles.remove(role).catch(() => {});
              removedRoles.push(role.name);
            }
          }
        }

        const currentChosenTags = selectedRoleIds
          .map(id => `<@&${id}>`)
          .join(', ');

        const msg = selectedRoleIds.length > 0
          ? `✅ อัปเดตยศของคุณเรียบร้อยแล้วค่ะ! ${isGame ? '🎮' : '✨'}💖\n**ยศที่คุณเลือก:** ${currentChosenTags}`
          : `➖ ยกเลิกยศทั้งหมดในรายการนี้เรียบร้อยแล้วค่ะ ${isGame ? '🎮' : '✨'}`;

        await interaction.reply({
          content: msg,
          flags: 64
        }).catch(() => {});
      } catch (error) {
        console.error('Error handling select menu:', error);
        await interaction.reply({
          content: '❌ เกิดข้อผิดพลาดในการจัดการยศ โปรดแจ้งผู้ดูแลเซิร์ฟเวอร์',
          flags: 64
        }).catch(() => {});
      }
    }
  }
}


