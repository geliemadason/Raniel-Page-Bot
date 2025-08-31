const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbdl',
  description: 'Download Facebook video using Kaiz API',
  usage: 'fbdl [facebook link]',
  author: 'Modified by Raniel',

  async execute(senderId, args, pageAccessToken) {
    const url = args.join(' ').trim();
    if (!url) {
      return sendMessage(senderId, { text: `❌ Usage: fbdl [facebook link]` }, pageAccessToken);
    }

    try {
      // Call Kaiz API
      const response = await axios.get("https://kaiz-apis.gleeze.com/api/fbdl", {
        params: {
          url,
          apikey: "8c0a049d-29a8-474a-b15e-189e42e150fb"
        }
      });

      const data = response.data;

      if (!data || !data.video || !data.video[0]?.url) {
        return sendMessage(senderId, { text: '❌ Error: No downloadable video found for the provided link.' }, pageAccessToken);
      }

    
      const video = data.video.find(v => v.quality === 'HD') || data.video[0];
      const videoUrl = video.url;

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: { url: videoUrl }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("FB Download Error:", error);
      return sendMessage(senderId, { text: `❌ Error fetching video: ${error.message}` }, pageAccessToken);
    }
  }
};
