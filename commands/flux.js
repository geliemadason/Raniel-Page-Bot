const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: 'Générer une image avec l’API Flux (image directe)',
  usage: '-flux [prompt]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: '⚠️ Tu dois fournir une description d’image.\nExemple : `-flux dragon rouge volant dans une tempête`'
      }, pageAccessToken);
    }

    // ✅ Message de génération en cours
    await sendMessage(senderId, {
      text: `🧠 Génération de l’image en cours pour :\n「${prompt}」\n\nPatiente un instant...`
    }, pageAccessToken);

    const imageUrl = `https://zaikyoov3.koyeb.app/api/flux-1.1-pro?prompt=${encodeURIComponent(prompt)}`;

    try {
      // 📷 Envoi direct de l’image (API retourne une image)
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('[Flux ERROR]', error.message);
      console.error('[Flux RAW]', error.response?.data || 'Pas de réponse');
      sendMessage(senderId, {
        text: '❌ La génération de l’image a échoué. Merci de réessayer avec un autre prompt.'
      }, pageAccessToken);
    }
  }
};