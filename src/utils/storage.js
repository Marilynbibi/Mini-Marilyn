import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const defaultGuildSettings = {
  welcome: {
    enabled: true,
    channelId: null,
    message: "ยินดีต้อนรับคุณ {user} เข้าสู่เซิร์ฟเวอร์ **{server}**! 🎉\nคุณคือสมาชิกคนที่ **{count}** ของเรา 🐶✨",
    embedColor: "#FFB6C1", // Cute soft pink
    showAvatar: true,
    gifUrl: "https://media.giphy.com/media/l4pT7ZzGjG0jZ9Vvy/giphy.gif"
  },
  goodbye: {
    enabled: true,
    channelId: null,
    message: "ลาก่อนนะคะคุณ **{user}** หวังว่าเราจะได้พบกันใหม่อีกครั้งที่ **{server}** นะคะ 🥺👋\nตอนนี้เหลือสมาชิก **{count}** คน",
    embedColor: "#FFA07A", // Soft warm coral
    showAvatar: true,
    gifUrl: "https://media.giphy.com/media/efgV24BqJ0uQz555eG/giphy.gif"
  },
  autoRole: {
    enabled: true,
    roleIds: [] // list of role IDs to give on join
  },
  buttonRoles: {}, // customId -> { roleId, roleName }
  socials: {
    tiktok: "https://tiktok.com",
    instagram: "https://instagram.com",
    itchio: "https://itch.io"
  },
  ticket: {
    enabled: true,
    categoryId: null,
    supportRoleId: null,
    transcriptChannelId: null,
    panelChannelId: null,
    ticketCount: 0
  },
  serverStats: {
    enabled: false,
    categoryId: null,
    allMembersChannelId: null,
    membersChannelId: null,
    botsChannelId: null,
    allMembersFormat: "🌸 All Members : {count}",
    membersFormat: "🍥 Members : {count}",
    botsFormat: "👘 Bots : {count}"
  },
  gender: {
    enabled: true,
    maleRoleId: null,
    femaleRoleId: null,
    otherRoleId: null,
    exclusive: true
  }
};

export function loadAllConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading config.json:', error);
    return {};
  }
}

export function saveAllConfig(newConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving config.json:', error);
    return false;
  }
}

// Get config for a specific guild
export function getGuildConfig(guildId) {
  const all = loadAllConfig();
  if (!guildId) return { ...defaultGuildSettings };

  // If old flat format existed, migrate it
  if (all.welcome && !all[guildId]) {
    all[guildId] = {
      welcome: { ...defaultGuildSettings.welcome, ...all.welcome },
      goodbye: { ...defaultGuildSettings.goodbye, ...(all.goodbye || {}) },
      autoRole: { ...defaultGuildSettings.autoRole, ...all.autoRole },
      buttonRoles: all.buttonRoles || {}
    };
    saveAllConfig(all);
  }

  if (!all[guildId]) {
    all[guildId] = JSON.parse(JSON.stringify(defaultGuildSettings));
    saveAllConfig(all);
  }

  return {
    ...defaultGuildSettings,
    ...all[guildId],
    welcome: { ...defaultGuildSettings.welcome, ...(all[guildId].welcome || {}) },
    goodbye: { ...defaultGuildSettings.goodbye, ...(all[guildId].goodbye || {}) },
    autoRole: { ...defaultGuildSettings.autoRole, ...(all[guildId].autoRole || {}) },
    ticket: { ...defaultGuildSettings.ticket, ...(all[guildId].ticket || {}) },
    serverStats: { ...defaultGuildSettings.serverStats, ...(all[guildId].serverStats || {}) },
    buttonRoles: { ...(all[guildId].buttonRoles || {}) }
  };
}

// Save config for a specific guild
export function saveGuildConfig(guildId, guildConfig) {
  const all = loadAllConfig();
  all[guildId] = guildConfig;
  return saveAllConfig(all);
}

// Helper aliases for backwards compatibility
export function loadConfig(guildId) {
  return getGuildConfig(guildId);
}

export function saveConfig(guildConfig, guildId) {
  if (guildId) {
    return saveGuildConfig(guildId, guildConfig);
  }
  const all = loadAllConfig();
  return saveAllConfig({ ...all, ...guildConfig });
}
