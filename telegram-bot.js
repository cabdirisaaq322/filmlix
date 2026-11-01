const BOT_TOKEN = '9035746668:AAEjvRFQECoLYt1YHJAIsos2bcNdhBfWbNk';
const ADMIN_USER_ID = 1911107342;
const BLOCKLIST_PATH = require('path').join(process.cwd(), 'blocked-movies.json');

let blocked = [];

function loadBlocklist() {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(BLOCKLIST_PATH, 'utf-8');
    blocked = JSON.parse(data);
    if (!Array.isArray(blocked)) blocked = [];
  } catch {
    blocked = [];
  }
}

function saveBlocklist() {
  const fs = require('fs');
  fs.writeFileSync(BLOCKLIST_PATH, JSON.stringify(blocked, null, 2));
}

function isBlocked(id) {
  return blocked.includes(id);
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  }).catch(() => {});
}

async function getUpdates(offset) {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`
  );
  return res.json();
}

async function handleUpdate(update) {
  const message = update.message || update.edited_message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const userId = message.from.id;
  const text = message.text.trim();

  // Only admin can use the bot
  if (userId !== ADMIN_USER_ID) {
    await sendMessage(chatId, 'Unauthorized. This bot is private.');
    return;
  }

  const args = text.split(/\s+/);
  const cmd = args[0].toLowerCase();

  if (cmd === '/start' || cmd === '/help') {
    await sendMessage(chatId,
      '*Admin Bot*\n\nCommands:\n`/block <movie_id>` — Block a movie\n`/unblock <movie_id>` — Unblock a movie\n`/list` — Show blocked movies\n`/help` — Show this help'
    );
  } else if (cmd === '/block') {
    const id = parseInt(args[1], 10);
    if (!id || isNaN(id)) {
      await sendMessage(chatId, 'Usage: `/block <movie_id>`');
      return;
    }
    if (isBlocked(id)) {
      await sendMessage(chatId, `Movie *${id}* is already blocked.`);
      return;
    }
    blocked.push(id);
    saveBlocklist();
    await sendMessage(chatId, `Movie *${id}* blocked. It will no longer appear in search or play.`);
  } else if (cmd === '/unblock') {
    const id = parseInt(args[1], 10);
    if (!id || isNaN(id)) {
      await sendMessage(chatId, 'Usage: `/unblock <movie_id>`');
      return;
    }
    if (!isBlocked(id)) {
      await sendMessage(chatId, `Movie *${id}* is not blocked.`);
      return;
    }
    blocked = blocked.filter((i) => i !== id);
    saveBlocklist();
    await sendMessage(chatId, `Movie *${id}* unblocked.`);
  } else if (cmd === '/list') {
    if (blocked.length === 0) {
      await sendMessage(chatId, 'No blocked movies.');
    } else {
      await sendMessage(chatId, 'Blocked movies:\n' + blocked.map((i) => `• *${i}*`).join('\n'));
    }
  } else {
    await sendMessage(chatId, 'Unknown command. Send /help for available commands.');
  }
}

async function main() {
  loadBlocklist();
  let offset = 0;
  console.log('Admin bot running...');
  while (true) {
    try {
      const result = await getUpdates(offset);
      if (result.ok && result.result) {
        for (const update of result.result) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
