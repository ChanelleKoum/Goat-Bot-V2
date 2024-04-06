const axios = require("axios");
const fs = require("fs");

const globalData = {
  poke: {},
  fff: [],
};

module.exports = {
  config: {
    name: "pokecatch",
    aliases: ["pcatch"],
    version: "1.2",
    author: "Shikaki,\nAusum",
    countDown: 20,
    role: 0,
    shortDescription: "Spawn and catch Pokémon",
    longDescription: "Catch a randomly spawned Pokémon",
    category: "🐍 Pokemon",
    guide: "{pn} {{[on | off]}}",
    envConfig: {
      deltaNext: 5,
    },
  },

  onStart: async function ({ api, threadsData, usersData, event, message }) {
    try {
      const pokeData = await axios.get("https://raw.githubusercontent.com/theone2277/pokos/main/pokeData");
      const pokos = pokeData.data;
      const pokedbPath = "pokedb.json";

      if (!fs.existsSync(pokedbPath)) {
        fs.writeFileSync(pokedbPath, JSON.stringify({ users: {} }));
      }

      const pokedb = JSON.parse(fs.readFileSync(pokedbPath, "utf8"));

      const userId = event.senderID;

      const alreadyCaught = pokedb.users[userId]?.pokemons || [];

      let ind = getRandom(pokos, alreadyCaught);
      try {
        const form = {
          body: "A wild Pokémon has appeared! Reply its name to catch it.",
          attachment: await global.utils.getStreamFromURL(pokos[ind].image),
        };
        message.reply(form, (err, info) => {
          globalData.fff.push(info.messageID);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "pokecatch",
            mid: info.messageID,
            name: pokos[ind].name,
            ind: ind,
          });
        });
      } catch (e) {
        console.error("Error in pokecatch onStart:", e);
        message.reply('Server busy. Please try again later.');
      }
    } catch (error) {
      console.error("Error in pokecatch onStart:", error);
      message.reply("An error occurred. Please try again later.");
    }
  },

  onReply: async function ({ event, api, Reply, message }) {
    try {
      const pokeData = await axios.get("https://raw.githubusercontent.com/theone2277/pokos/main/pokeData");
      const pokos = pokeData.data;
      const pokedbPath = "pokedb.json";

      const userId = event.senderID;

      const caughtPokemon = Reply.name.toLowerCase(); 
      const userReply = event.body.toLowerCase(); 

      const pokedb = fs.existsSync(pokedbPath)
        ? JSON.parse(fs.readFileSync(pokedbPath, "utf8"))
        : { users: {} };

      pokedb.users[userId] = pokedb.users[userId] || { pokemons: [] };

      if (userReply === caughtPokemon) {
        if (!pokedb.users[userId].pokemons.includes(caughtPokemon)) {
          pokedb.users[userId].pokemons.push(caughtPokemon);

          fs.writeFileSync(pokedbPath, JSON.stringify(pokedb));

          message.reply({
            body: "Well done! " + caughtPokemon + " is now in your Pokedex.",
            attachment: await global.utils.getStreamFromURL(pokos[Reply.ind].image),
          });

          api.unsendMessage(Reply.mid);
        } else {
          message.reply("You have already caught " + caughtPokemon + ".");
        }
      } else {

        message.reply("Oops, you didn't catch the correct Pokémon. Try again!");
      }
    } catch (error) {
      console.error("Error in pokecatch onReply:", error);
      message.reply("An error occurred. Please try again later.");
    }
  },
};

function getRandomInt(arra) {
  return Math.floor(Math.random() * arra.length);
}

function getRandom(arra, excludeArray) {
  let randomNumber;

  if (!Array.isArray(excludeArray)) {
    randomNumber = getRandomInt(arra);
    return randomNumber;
  }

  do {
    randomNumber = getRandomInt(arra);
  } while (excludeArray.includes(randomNumber));

  return randomNumber;
}
