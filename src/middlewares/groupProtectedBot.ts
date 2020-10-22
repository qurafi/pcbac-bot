import { Context } from "telegraf";

const admins = ["mhnaru"];
const groups = ["pcbac", "kfii50yr"];

export default (ctx, next) => {
    let { update } = ctx;
    let message = update.message ?? update.edited_message;
    if (!message) return next();

    let { chat } = message;

    let chat_username = chat?.username?.toLowerCase();

    let isBotJoined = message?.new_chat_member?.username === ctx.botInfo.username;

    if (isBotJoined && !groups.includes(chat_username)) {
        ctx.replyWithMarkdown(
            `*This bot only belongs to @pcbac group \nهذا البوت ينتمي فقط لمجموعة @pcbac*`
        );

        return ctx.leaveChat();
    }

    if (chat.type === "private" && !admins.includes(chat_username)) {
        return ctx.replyWithMarkdown(
            `*This bot only works on @pcbac group\nهذا البوت فقط يعمل في مجموعة @pcbac*`
        );
    }

    next();
};
