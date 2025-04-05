const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  name: "shoti",
  usePrefix: false,
  usage: "shoti",
  version: "1.0",
  execute: async ({ api, event, pageAccessToken }) => {
    try {
      // Set reaction to indicate processing
      api.setMessageReaction("⏳", event.messageID, () => {}, true, pageAccessToken); // Add pageAccessToken

      // Fetch random TikTok video
      const response = await axios.get("https://apis-rho-nine.vercel.app/tikrandom");
      console.log("📜 API Response:", response.data);

      if (!response.data || !response.data.playUrl) {
        api.setMessageReaction("❌", event.messageID, () => {}, true, pageAccessToken); // Add pageAccessToken
        return api.sendMessage("⚠️ No video URL received from API.", event.senderID, pageAccessToken); // Add pageAccessToken
      }

      const videoUrl = response.data.playUrl;
      const filePath = path.join(__dirname, "tikrandom.mp4");

      // Download the video
      const writer = fs.createWriteStream(filePath);
      const videoResponse = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
      });
      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {
        api.setMessageReaction("✅", event.messageID, () => {}, true, pageAccessToken); // Add pageAccessToken
        const msg = {
          body: "🎥 Here is a random TikTok video!\n",
          attachment: fs.createReadStream(filePath),
        };
        api.sendMessage(msg, event.senderID, pageAccessToken, (err) => { // Add pageAccessToken
          if (err) {
            console.error("❌ Error sending video:", err);
            return api.sendMessage("⚠️ Failed to send video.", event.senderID, pageAccessToken); // Add pageAccessToken
          }
          // Delete file after sending
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
          });
        });
      });

      writer.on("error", (err) => {
        console.error("❌ Error downloading video:", err);
        api.setMessageReaction("❌", event.messageID, () => {}, true, pageAccessToken); // Add pageAccessToken
        api.sendMessage("⚠️ Failed to download video.", event.senderID, pageAccessToken); // Add pageAccessToken
      });
    } catch (error) {
      console.error("❌ Error fetching video:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true, pageAccessToken); // Add pageAccessToken
      api.sendMessage(`⚠️ Could not fetch the video. Error: ${error.message}`, event.senderID, pageAccessToken); // Add pageAccessToken
    }
  },
};
