module.exports.config = {
  name: "tempmail",
  version: "1.0.0",
  role: 0,
  aliases: ["TempMail"],
  credits: "developer",
  description: "Generate a temporary email or check inbox",
  cooldown: 0,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args }) {
  const axios = require("axios");
  const EMAIL_API_URL = "https://apis-markdevs69v2.onrender.com/new/api/gen";
  const INBOX_API_URL = "https://xapiz.onrender.com/tempmail/inbox?email=";

  let { messageID, threadID, senderID } = event;
  let tid = threadID, mid = messageID;

  try {
    if (args.length === 0) {
      return api.sendMessage("tempmail create (generate email)\ntempmail inbox <email> (check inbox)", tid, mid);
    }

    const command = args[0].toLowerCase();

    if (command === 'create') {
      try {
        // Generate a random temporary email
        const response = await axios.get(EMAIL_API_URL);
        const email = response.data.email;

        if (!email) {
          throw new Error("Failed to generate email");
        }

        return api.sendMessage(`Generated email ✉️: ${email}`, tid, mid);
      } catch (error) {
        console.error("❌ | Failed to generate email", error.message);
        return api.sendMessage(`❌ | Failed to generate email. Error: ${error.message}`, tid, mid);
      }
    } else if (command === 'inbox' && args.length === 2) {
      const email = args[1];
      if (!email) {
        return api.sendMessage("❌ | Please provide an email address to check the inbox.", tid, mid);
      }

      try {
        // Retrieve messages from the specified email
        const inboxResponse = await axios.get(`${INBOX_API_URL}${email}`);
        const inboxMessages = inboxResponse.data;

        if (!Array.isArray(inboxMessages)) {
          throw new Error("Unexpected response format");
        }

        if (inboxMessages.length === 0) {
          return api.sendMessage("❌ | No messages found in the inbox.", tid, mid);
        }

        // Get the most recent message
        const latestMessage = inboxMessages[0];
        const from = latestMessage.from || "Unknown sender";
        const date = latestMessage.date || "Unknown date";
        const subject = latestMessage.subject || "No subject";

        const formattedMessage = `📧 From: ${from}\n📩 Subject: ${subject}\n📅 Date: ${date}\n━━━━━━━━━━━━━━━━`;
        return api.sendMessage(`━━━━━━━━━━━━━━━━\n📬 Inbox messages for ${email}:\n${formattedMessage}`, tid, mid);
      } catch (error) {
        console.error(`❌ | Failed to retrieve inbox messages`, error.message);
        return api.sendMessage(`❌ | Failed to retrieve inbox messages. Error: ${error.message}`, tid, mid);
      }
    } else {
      return api.sendMessage("❌ | Invalid command. Use 'tempmail create' (generate email) or 'tempmail inbox <email>' to check inbox.", tid, mid);
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return api.sendMessage(`❌ | An unexpected error occurred: ${error.message}`, tid, mid);
  }
};
