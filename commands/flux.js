const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: 'Générer une image avec l’API Flux',
  usage: '-flux [prompt]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: '⚠️ Fournis un prompt.\nExemple : -flux robot dans la neige'
      }, pageAccessToken);
    }

    // 🧠 Message de chargement
    await sendMessage(senderId, {
      text: `🧠 Génération de l’image en cours pour :\n「${prompt}」\n\nPatiente un instant...`
    }, pageAccessToken);

    const imageUrl = `https://zaikyoov3.koyeb.app/api/flux-1.1-pro?prompt=${encodeURIComponent(prompt)}`;
    console.log('[FLUX BOT] Envoi de l’image :', imageUrl);

    try {
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
      console.error('[Flux RESPONSE]', error.response?.data || 'Pas de réponse');
      sendMessage(senderId, {
        text: '❌ Échec lors de l’envoi de l’image. Essaye un autre prompt.'
      }, pageAccessToken);
    }
  }
};