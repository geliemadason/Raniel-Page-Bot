const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gemini',
  description: 'Analyze an image using Google Gemini Vision API',
  usage: 'gemini [your prompt] (must reply to an image)',
  author: 'Raniel',

  async execute(senderId, args, pageAccessToken, messageEvent) {
    const prompt = args.join(' ') || 'Describe this image in detail.';

    // Check if command is replying to a message with an image
    const replied = messageEvent?.message?.reply_to?.message;
    const image = replied?.attachments?.find(a => a.type === 'image');

    if (!image) {
      return sendMessage(senderId, {
        text: '❎ | Please reply to an image and include your prompt.\n\nExample:\nReply to a photo and type:\n`gemini what is happening in this image?`',
      }, pageAccessToken);
    }

    const imageUrl = image.payload.url;

    try {
      const base64Image = await getBase64FromUrl(imageUrl);

      const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace this
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ]
        }
      );

      const geminiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (geminiReply) {
        await sendMessage(senderId, { text: `📷 Gemini:\n\n${geminiReply}` }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: '⚠️ Gemini did not return any response.' }, pageAccessToken);
      }

    } catch (err) {
      console.error('Gemini Vision Error:', err.message);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while analyzing the image.',
      }, pageAccessToken);
    }
  }
};

// Helper to fetch image and convert to base64
async function getBase64FromUrl(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data, 'binary').toString('base64');
}
