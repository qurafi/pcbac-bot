import { parseCPUArgs, matchProcessor } from "./cpu";
import { DDB } from "../ddb";

const tableName = process.env.PROCESSORS_PRICES_TABLE;
const amazonURL = "amazon.com/dp/";

const locale = require("../../localization.json");
const amznl = locale.AMAZON;

export async function getCPUPrice(models: string[]) {
	try {
		const params = {
			RequestItems: {
				[tableName]: { Keys: models.map((v) => ({ Model: v })) },
			},
		};

		const data = await DDB.batchGet(params).promise();
		return data && data.Responses && data.Responses[tableName];
	} catch (e) {
		console.error(e);
	}
}

async function AmazonCommand({ ctx, args }) {
	const items = matchProcessor(args);
	if (typeof items === "string") {
		ctx.replyWithMarkdown(items);
		return;
	}

	const models = items.slice(0, 5).map((v) => `${v.Line} ${v.Model}`);

	const data = await getCPUPrice(models);
	const list = data
		.filter((v) => !!v.Link)
		.map((v) => {
			return `[${v.Model}](${amazonURL}${v.Link}) - 💰${
				v.Price || amznl.PRICE_UNAVAILABLE
			}`;
		});

	if (list.length === 0) {
		ctx.replyWithMarkdown(amznl.URL_NOT_FOUND);
		return;
	}
	return ctx.replyWithMarkdown(list.join("\n"));
}

export default (commands): void => {
	commands.create("amazon", {
		helpMessage: amznl.help,
		required: true,
		parseArgsOptions: parseCPUArgs,
		handler: AmazonCommand,
	});
};
