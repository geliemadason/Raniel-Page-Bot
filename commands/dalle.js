const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'dalle',
  description: 'Génère une image téléchargeable avec DALL·E 3',
  usage: '-dalle [prompt]',
  author: 'gandxo',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: '⚠️ Fournis un prompt.\nExemple : `-dalle animal mystique dans les nuages`'
      }, pageAccessToken);
    }

    const apiUrl = `https://haji-mix-api.gleeze.com/api/imagen?prompt=${encodeURIComponent(prompt)}&model=dall-e-3&style=natural&quality=natural&size=1024x1024&api_key=62380432c9adf57b79b13da5a5bca40b0dcf0d201012ade194872751ebb8fc00`;

    await sendMessage(senderId, {
      text: `🧠 Génération de l’image DALL·E 3 pour :\n「${prompt}」\nPatiente un instant...`
    }, pageAccessToken);

    try {
      // Étape 1 : Obtenir l'URL d'image
      const response = await axios.get(apiUrl);
      const imageUrl = response.data?.image;

      if (!imageUrl) {
        return sendMessage(senderId, { text: '❌ Erreur lors de la génération de l’image.' }, pageAccessToken);
      }

      // Étape 2 : Télécharger l’image localement
      const localPath = path.join(__dirname, 'temp.jpg');
      const imageStream = await axios({
        url: imageUrl,
        responseType: 'stream'
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(localPath);
        imageStream.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Étape 3 : Envoyer l’image à l’API Messenger pour obtenir un attachment_id
      const form = new FormData();
      form.append('filedata', fs.createReadStream(localPath));
      form.append('message', JSON.stringify({ attachment: { type: 'image', payload: { is_reusable: true } } }));
      const uploadRes = await axios.post(`https://graph.facebook.com/v17.0/me/message_attachments?access_token=${pageAccessToken}`, form, {
        headers: form.getHeaders()
      });

      const attachmentId = uploadRes.data.attachment_id;

      // Étape 4 : Envoyer l’image en tant que media Messenger natif
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            attachment_id: attachmentId
          }
        }
      }, pageAccessToken);

      // Nettoyage du fichier local
      fs.unlinkSync(localPath);

    } catch (error) {
      console.error('[ERREUR DALL·E]', error.message);
      sendMessage(senderId, {
        text: '❌ Une erreur est survenue pendant l’envoi de l’image.'
      }, pageAccessToken);
    }
  }
};