const axios = require('axios');
module.exports = {
	config: {
		name: "out",
		aliases: ["out"],
		version: "1.0",
		author: "milan-says",
		countDown: 5,
		role: 2,
		shortDescription: "out of gc",
		longDescription: "",
		category: "admin",
		guide: {
			vi: "{pn} ",
			en: "{pn} "
		}
	},
onStart: async function ({ message, args, api, user, event, usersData }) {
        if (!args[0]) return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
        if (!isNaN(args[0])) return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
}
};
