const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // adapte le chemin

function toUnicodeBold(str) {
  const map = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠',
    'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺',
    'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
    ' ': ' ', '\n': '\n', ',': ',', '.': '.', '!': '!', '?': '?'
  };
  return [...str].map(c => map[c] || c).join('');
}

function parseBold(text) {
  // Remplace chaque **mot** par sa version en gras unicode
  return text.replace(/\*\*(.*?)\*\*/gs, (_, match) => toUnicodeBold(match));
}

module.exports = {
  name: 'gpt4',
  description: 'Pose ta question 😄, Gandxo Airépond et met en gras ce qui est entre ** **',
  usage: 'gpt4 <ta question>',
  author: 'GBAGUIDI Exaucé',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, { text: "⚠️ Utilise : gpt4 <ta question>" }, pageAccessToken);
    }

    const roleplay = `Tu es Gandxo Ai, un assistant IA développé par GBAGUIDI Exaucé. Tu te comportes exactement comme ChatGPT, en répondant clairement, poliment, utilement et sans blague inutile.`;

    try {
      const url = `https://haji-mix-api.gleeze.com/api/gpt4o?ask=${encodeURIComponent(prompt)}&uid=${senderId}&roleplay=${encodeURIComponent(roleplay)}&api_key=62380432c9adf57b79b13da5a5bca40b0dcf0d201012ade194872751ebb8fc00`;
      const { data } = await axios.get(url);

      let reply = data.answer || "🤔 Je n'ai pas compris ta question.";
      reply = parseBold(reply);

      const maxLength = 2000;
      for (let i = 0; i < reply.length; i += maxLength) {
        await sendMessage(senderId, { text: reply.substring(i, i + maxLength) }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur GPT4 :", error.message);
      await sendMessage(senderId, { text: "😵‍💫 Oups, problème serveur. Réessaie plus tard." }, pageAccessToken);
    }
  }
};