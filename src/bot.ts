import "dotenv-flow/config";

import { Telegraf } from "telegraf";
import CommandManager from "telegraf-encommands";
import protection from "./middlewares/protection";
import addCPUCommand from "./commands/cpu";
import addAmazonCommand from "./commands/amazon";
import addCPUMarkCommand from "./commands/benchmarks";
import addSSDCommand from "./commands/ssd";
import addPSUCommand from "./commands/psu";
import rateLimit from "telegraf-ratelimit";

import linksAnalyser from "./middlewares/linksAnalyser";
import dynamoKVStore from "dynamo-kvstore";

const isDevEnv = process.env.NODE_ENV === "development";

const options = isDevEnv && {
	endpoint: "http://localhost:7000",
	region: "us-east-2",
};

const botRepliesStore = new dynamoKVStore("bot-replies", options);

export const bot = new Telegraf(process.env.BOT_TOKEN);

console.log("bot running");
export const commands = new CommandManager({
	replyCacheAge: 86400 * 3,
});

if (!isDevEnv) botRepliesStore.then((v) => (commands.cacheStore = v));

bot.use(
	rateLimit({
		window: 3000,
		limit: 1,
	})
);

bot.use(protection);
bot.use(commands.middleware);
bot.use(linksAnalyser);

addCPUCommand(commands);
addAmazonCommand(commands);
addCPUMarkCommand(commands);
addSSDCommand(commands);
addPSUCommand(commands);

bot.catch((e) => {
	console.error(e);
});

if (isDevEnv) {
	console.log("bot running in dev mode");
	bot.launch();
}
