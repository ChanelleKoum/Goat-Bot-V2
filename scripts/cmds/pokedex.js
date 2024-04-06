const fs = require('fs');

function formatMessage(pokemonArray, pageNumber, totalPages) {
  const maxDisplay = 20;
  const startIndex = (pageNumber - 1) * maxDisplay;
  const endIndex = startIndex + maxDisplay;
  const pokemonSubset = pokemonArray.slice(startIndex, endIndex);

  let formattedNames = '';
  const sortedPokemons = pokemonSubset.sort((a, b) => a.localeCompare(b));

  for (let i = 0; i < sortedPokemons.length; i++) {
    const pokemonName = sortedPokemons[i];
    formattedNames += `${startIndex + i + 1}. ${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}\n`;
  }

  if (pageNumber < totalPages) {
    formattedNames += `\nFor more Pokémon, use "pokedex ${pageNumber + 1}".`;
  } else {
    formattedNames += "\nYou don't have any more Pokémon to show. 😔";
  }

  formattedNames += ` (Page ${pageNumber}/${totalPages})`;

  return formattedNames;
}

module.exports = {
  config: {
    name: "pokedex",
    version: "1.2",
    author: "Shikaki",
    shortDescription: "View Pokémon names",
    longDescription: "",
    category: "🐍 Pokemon",
    guide: "{pn}",
  },

  onStart: async function ({ api, event, threadsData, args, message }) {
    const pokedb = JSON.parse(fs.readFileSync('pokedb.json', 'utf8'));
    const senderID = event.senderID;

    let pageNumber = 1;

    if (args[0]) {
      pageNumber = parseInt(args[0]);
    }

    if (pageNumber < 1) {
      return message.reply("You have entered an invalid page number. Please try again.");
    }

    let userPokedex = pokedb.users[senderID]?.pokemons || [];

    userPokedex = userPokedex.sort((a, b) => a.localeCompare(b));

    const totalPages = Math.ceil(userPokedex.length / 20);

    if (pageNumber > totalPages) {
      return message.reply("You don't have any more Pokémon to show. 😔");
    }

    const formattedPokemonNames = formatMessage(userPokedex, pageNumber, totalPages);
    const reply = `🔥 Your Pokédex:\n\n${formattedPokemonNames}`;
    return message.reply(reply);
  }
};
