const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'dalle',
  description: 'Génère une image avec DALL·E 3 (style et qualité natural)',
  usage: '-dalle [prompt]',
  author: 'gandxo',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: '⚠️ Tu dois fournir une description d’image.\nExemple : `-dalle paysage africain au coucher du soleil`'
      }, pageAccessToken);
    }

    // Génération de l’URL avec paramètres fixes
    const imageUrl = `https://haji-mix-api.gleeze.com/api/imagen?prompt=${encodeURIComponent(prompt)}&model=dall-e-3&style=natural&quality=natural&size=1024x1024&api_key=62380432c9adf57b79b13da5a5bca40b0dcf0d201012ade194872751ebb8fc00`;

    // 🧠 Message de génération
    await sendMessage(senderId, {
      text: `🧠 Génération de l’image avec DALL·E 3 pour :\n「${prompt}」\n\nPatiente un instant...`
    }, pageAccessToken);

    try {
      // 📷 Envoi direct de l’image générée
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
      console.error('[DALL·E ERROR]', error.message);
      console.error('[DALL·E RESPONSE]', error.response?.data || 'Pas de réponse');
      sendMessage(senderId, {
        text: '❌ La génération de l’image a échoué. Essaye un autre prompt.'
      }, pageAccessToken);
    }
  }
};