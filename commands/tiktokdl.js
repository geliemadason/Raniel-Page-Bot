const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tiktok',
  description: 'Download TikTok video',
  usage: 'tiktok <video link>',
  author: 'raniel',
  execute: async (senderId, args) => {
    const pageAccessToken = token;
    const videoLink = args.join(' ');
    if (!videoLink) {
      return sendMessage(senderId, { text: 'Usage: tiktok <video link>' }, pageAccessToken);
    }
    try {
      const response = await axios.get(`https://sandipbaruwal.onrender.com/tikdown?url=${encodeURIComponent(videoLink)}`);
      const videoData = response.data;
      const videoUrl = videoData;
      if (!videoUrl) {
        return sendMessage(senderId, { text: 'Failed to retrieve video.' }, pageAccessToken);
      }
      sendMessage(senderId, { attachment: { type: 'video', payload: { url: videoUrl } } }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error.message);
      sendMessage(senderId, { text: 'An error occurred. Try again later.' }, pageAccessToken);
    }
  }
};