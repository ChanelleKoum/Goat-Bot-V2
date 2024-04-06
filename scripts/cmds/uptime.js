module.exports = {
  config: {
    name: "uptime",
aliases: ["upt"],
    version: "1.0",
    author: "OtinXSandip",
    role: 2,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime "
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "system",
    guide: {
      en: "Use {p}totalusers to display the total number of users of the bot and check uptime."
    }
  },
  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
   const days = 
Math.floor(uptime / (3600 * 24));
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `${days}days ${hours}𝑯𝒓𝒔 ${minutes}𝑴𝒊𝒏 ${seconds}𝑺𝒆𝒄`;
      
      api.sendMessage(`✨| ✿𝑩𝑶𝑻 𝑹𝑼𝑵𝑵𝑰𝑵𝑮 𝑻𝑰𝑴𝑬✿\n☞ ${uptimeString}\n\n✡ | Total Users\n☞ ${allUsers.length}\n🎗| Total threads\n☞ ${allThreads.length}`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
