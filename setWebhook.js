require("dotenv").config({ path: __dirname + "/.env.development" });
const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const args = process.argv.slice(2);
const localURL = "https://98466d4eb50f.ngrok.io";
const awsURL = "https://ysxjs3edik.execute-api.us-east-2.amazonaws.com";

(async () => {
	let info = await bot.telegram.getWebhookInfo();
	const isAWS = args[0] === "aws";
	const stage = args[1] || "dev";
	const url = `${isAWS ? awsURL : localURL}/${stage}/bot`;

	if (info && (info.url === "" || info.url !== url)) {
		await bot.telegram.deleteWebhook();
	}

	try {
		await bot.telegram.setWebhook(url);
	} catch (e) {
		console.error(e);
	}
})();
