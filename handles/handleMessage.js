const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = '-';

// Image cache: stores last image URL per sender
const imageCache = new Map();

// Load command modules
fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`../commands/${file}`);
    commands.set(command.name.toLowerCase(), command);
  });

async function handleMessage(event, pageAccessToken) {
  const senderId = event?.sender?.id;
  if (!senderId) return console.error('Invalid event object');

  const messageText = event?.message?.text?.trim();

  // Cache any image attachments
  const attachments = event?.message?.attachments || [];
  for (const attachment of attachments) {
    if (attachment.type === 'image' && attachment.payload?.url) {
      console.log(`Caching image for sender ${senderId}: ${attachment.payload.url}`);
      imageCache.set(senderId, {
        url: attachment.payload.url,
        timestamp: Date.now()
      });
    }
  }

  // If no text command, stop here (for example user just sent an image)
  if (!messageText) {
    return console.log('Received event without message text');
  }

  const [commandName, ...args] = messageText.startsWith(prefix)
    ? messageText.slice(prefix.length).split(' ')
    : messageText.split(' ');

  const normalizedCommand = commandName.toLowerCase();

  try {
    console.log(`Received command: ${normalizedCommand}, args: ${args.join(' ')}`);

    if (commands.has(normalizedCommand)) {
      await commands.get(normalizedCommand).execute(senderId, args, pageAccessToken, event, sendMessage, imageCache);
    } else if (commands.has('ai')) {
      await commands.get('ai').execute(senderId, [messageText], pageAccessToken, event, sendMessage, imageCache);
    } else {
      await sendMessage(senderId, { text: 'Unknown command and AI fallback is unavailable.' }, pageAccessToken);
    }
  } catch (error) {
    console.error(`Error executing command:`, error);
    await sendMessage(senderId, { text: error.message || 'There was an error executing that command.' }, pageAccessToken);
  }
}

module.exports = { handleMessage };