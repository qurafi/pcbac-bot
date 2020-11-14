const admins = process.env.ADMINS?.split(",");
const groups = process.env.GROUPS?.split(",");

export default async (ctx, next) => {
	const { update } = ctx;
	const message = update.message ?? update.edited_message;
	if (!message) return next();

	const { chat } = message;

	const chat_username = chat?.username?.toLowerCase();
	if (admins && chat.type === "private" && !admins.includes(chat_username)) {
		return ctx.replyWithMarkdown(
			`*This bot only works on @pcbac group\nهذا البوت فقط يعمل في مجموعة @pcbac*`
		);
	}

	if (groups && chat.id < 0 && !groups.includes(chat_username)) {
		return ctx.leaveChat();
	}

	next();
};
