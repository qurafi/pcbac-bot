import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import CommandManager from "telegraf-encommands";
import groupProtectedBot from "./middlewares/groupProtectedBot";
import addCPUCommand from "./commands/cpu";
import addAmazonCommand from "./commands/amazon";
import addCPUMarkCommand from "./commands/cpumark";
// import linksAnalyser from "./middlewares/linksAnalyser";

export const bot = new Telegraf(process.env.BOT_TOKEN);
export const commands = new CommandManager();

bot.use(groupProtectedBot);
bot.use(commands.middleware);
// bot.use(linksAnalyser);

addCPUCommand(commands);
addAmazonCommand(commands);
addCPUMarkCommand(commands);

bot.launch();
