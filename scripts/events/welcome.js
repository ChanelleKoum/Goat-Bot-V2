const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "🍻🌟𝗠𝗲𝗿𝗰𝗶 𝗱𝗲 𝗺'𝗶𝗻𝘃𝗶𝘁𝗲𝗿 𝐚 𝐫𝐞𝐣𝐨𝐢𝐧𝐝𝐫𝐞 𝐜𝐞 𝐠𝐫𝐨𝐮𝐩𝐞 🔥\n𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅:☛ %1\n𝗧𝗼 𝘃𝗶𝗲𝘄 𝘁𝗵𝗲 𝗹𝗶𝘀𝘁 𝗼𝗳 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀, 𝗽𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿: (%1help) Signé Dominre.Xas ❤",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `🍨𝗕𝗼𝗻𝗷𝗼𝘂𝗿𝘀 𝗼𝘂 𝗕𝗼𝗻𝘀𝗼𝗶𝗿 🔥{userName}🔥.\n𝐖𝐞𝐥𝐜𝐨𝐦𝐞 {multiple}🍨𝐓𝐨 𝐭𝐡𝐞 𝐜𝐡𝐚𝐭 𝐆𝐫𝐨𝐮𝐩: 🥰{boxName}🥰\nℙ𝕒𝕤𝕤𝕖 𝕦𝕟𝕖 𝕓𝕠𝕟𝕟𝕖 𝕛𝕠𝕦𝕣𝕟𝕖́𝕖 𝕠𝕦 𝕤𝕠𝕚𝕣𝕖́𝕖 𝕞𝕠𝕟 𝕔𝕙𝕖𝕣𝕤 😁{session} 😊`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
