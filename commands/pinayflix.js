const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'pinayflix',
  description: 'Search for video from PinayFlix',
  usage: 'pinaysearch <search title>',
  author: 'Rized',
  execute: async (senderId, args) => {
    const pageAccessToken = token;
    const searchQuery = args.join(' ');

    if (!searchQuery) {
      return sendMessage(senderId, { text: '❌ Usage: pinaysearch <title>' }, pageAccessToken);
    }

    const apiUrl = `http://sgp1.hmvhostings.com:25743/pinay?search=${encodeURIComponent(searchQuery)}&page=1`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data || data.length === 0) {
        return sendMessage(senderId, { text: '❌ No videos found for the given search query.' }, pageAccessToken);
      }

      const video = data[0];
      const message = `🎥 **${video.title}** 🎥\n\n` + 
      `🔗 **Link**: ${video.url}\n` + 
      `🖼 **Preview Image**: ${video.thumbnail}\n\n` + 
      `Enjoy watching!`;
      const videoMessage = {
        attachment: {
          type: 'video',
          payload: {
            url: video.url,
            is_reusable: true
          }
        }
      };

      await sendMessage(senderId, { text: message }, pageAccessToken);
      await sendMessage(senderId, videoMessage, pageAccessToken);
    } catch (error) {
      console.error('Error:', error.message);
      sendMessage(senderId, { text: '❌ An error occurred while processing the request. Please try again later.' }, pageAccessToken);
    }
  }
};