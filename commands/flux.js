const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: 'Generate an image using Flux Realism API.',
  usage: '-flux [image prompt]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: '❗ Veuillez fournir une description pour générer l’image.\nExemple : -flux paysage futuriste dans l’espace'
      }, pageAccessToken);
    }

    const apiUrl = `https://zaikyoov3.koyeb.app/api/flux-1.1-pro?prompt=${encodeURIComponent(prompt)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data?.status && data?.response) {
        const imgUrl = data.response;

        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: imgUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        sendMessage(senderId, {
          text: '❌ La génération de l’image a échoué. Merci de réessayer avec un autre prompt.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Erreur génération Flux :', error.message);
      sendMessage(senderId, {
        text: '🚨 Une erreur s’est produite lors de la génération de l’image.'
      }, pageAccessToken);
    }
  }
};