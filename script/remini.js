const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "upscale",
  version: "1.0",
  role: 0,
  credits: "Jonell Magallanes",
  aliases: [],
  usages: "< reply image >",
  cd: 2,
};

module.exports.run = async ({ api, event, args }) => {
  const pathie = __dirname + `/cache/enhanced.jpg`;
  const { threadID, messageID } = event;

  const imageUrl = event.messageReply.attachments[0].url || args.join(" ");

  try {
    // Inform the user that the process has started
    const hshs = await api.sendMessage("⏱️ | Your Photo is Enhancing. Please Wait....", threadID, messageID);

    // Fetch the enhanced image URL from the API
    const response = await axios.get(`https://hiroshi-api.onrender.com/image/upscale?url=${encodeURIComponent(imageUrl)}`);
    const processedImageURL = response.data;

    // Download the enhanced image
    const imgResponse = await axios.get(processedImageURL, { responseType: 'stream' });
    const writer = fs.createWriteStream(pathie);
    imgResponse.data.pipe(writer);

    // Handle file save completion
    writer.on('finish', () => {
      api.unsendMessage(hshs.messageID);
      api.sendMessage({
        body: "🖼️ | Your Photo has been Enhanced!",
        attachment: fs.createReadStream(pathie)
      }, threadID, () => fs.unlinkSync(pathie), messageID);
    });

    // Handle any errors while saving the file
    writer.on('error', (error) => {
      api.sendMessage(`❎ | Error writing image to file: ${error}`, threadID, messageID);
    });

  } catch (error) {
    // Send an error message if something goes wrong
    api.sendMessage(`❎ | Error processing image: ${error}`, threadID, messageID);
  }
};
