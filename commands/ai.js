const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: 'ai',
    description: 'Interact with gpt4',
    usage: 'ai [your message]',
    author: 'coffee',

    async execute(senderId, args, pageAccessToken) {
        const prompt = args.join(' ');
        if (!prompt) return sendMessage(senderId, { text: "Usage: gpt4 <question>" }, pageAccessToken);

        try {
            const { data: { response } } = await axios.get(`https://kaiz-apis.gleeze.com/api/kaiz-ai?ask=${encodeURIComponent(prompt)}&uid=${senderId}&apikey=4b3c305a-5613-4aca-be9b-953b8b483c3c`);

            const parts = [];

            for (let i = 0; i < response.length; i += 1999) {
                parts.push(response.substring(i, i + 1999));
            }

            // send all msg parts
            for (const part of parts) {
                await sendMessage(senderId, { text: part }, pageAccessToken);
            }

        } catch {
            sendMessage(senderId, { text: 'There was an error generating the content. Please try again later.' }, pageAccessToken);
        }
    }
};
