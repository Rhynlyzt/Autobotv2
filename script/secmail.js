module.exports.config = {
  name: "secmail",
  version: "1.0.0",
  role: 0,
  aliases: ["GenMail"],
  credits: "developer",
  description: "Generate a temporary email or check inbox",
  cooldown: 0,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args }) {
  const axios = require("axios");
  const { sendMessage } = require('../handles/sendMessage');
  const domains = ["rteet.com", "dpptd.com", "1secmail.com", "1secmail.org", "1secmail.net"];

  let { messageID, threadID, senderID } = event;
  let tid = threadID, mid = messageID;

  const [cmd, email] = args;
  
  try {
    if (cmd === 'gen') {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const generatedEmail = `${Math.random().toString(36).slice(2, 10)}@${domain}`;
      return sendMessage(senderID, { text: `✨ Generated email: ${generatedEmail}` }, tid, mid);
    }

    if (cmd === 'inbox' && email && domains.some(d => email.endsWith(`@${d}`))) {
      try {
        const [username, domain] = email.split('@');
        const inbox = (await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`)).data;

        if (!inbox.length) {
          return sendMessage(senderID, { text: 'Inbox is empty.' }, tid, mid);
        }

        const { id, from, subject, date } = inbox[0];
        const { textBody } = (await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${id}`)).data;
        
        const emailContent = `📬 | Latest Email:\nFrom: ${from}\nSubject: ${subject}\nDate: ${date}\n\nContent:\n${textBody}`;
        return sendMessage(senderID, { text: emailContent }, tid, mid);
      } catch {
        return sendMessage(senderID, { text: 'Error: Unable to fetch inbox or email content.' }, tid, mid);
      }
    }

    return sendMessage(senderID, { text: 'Invalid usage. Use genmail gen or genmail inbox <email>' }, tid, mid);
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return sendMessage(senderID, { text: `❌ | An unexpected error occurred: ${error.message}` }, tid, mid);
  }
};
