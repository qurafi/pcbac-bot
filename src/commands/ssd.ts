import { Extra } from "telegraf";
import { MDB } from "../ddb";
const locale = require("../../localization.json");
const lssd = locale.SSD;

const ssds = MDB.get("ssds");

const keyFilters = {
	Write: (v) => v + " MB/s",
	Read: (v) => v + " MB/s",
	Link: (v) => `[Website](${v})`,
};

const basicKeys = [
	"Interface",
	"Form Factor",
	"Capacities",
	"DRAM",
	"NAND Type",
	"Read",
	"Write",
];

async function SSDCommand({ ctx, query }) {
	try {
		const res = await ssds.aggregate([
			{ $match: { $text: { $search: query, $language: "en" } } },
			{ $sort: { score: { $meta: "textScore" } } },
			{ $project: { _id: 0 } },
		]);

		if (!res || res.length === 0) {
			ctx.reply(lssd.NOT_FOUND);
			return;
		}

		const data = res[0];

		let rows = "";
		for (const k in data) {
			if (!basicKeys.includes(k)) continue;
			let v = data[k];
			if (v === undefined || v.toString().trim() == "") continue;
			if (keyFilters[k]) v = keyFilters[k](data[k]);

			rows += `*${k.replace("(*)", "")}*: ${v} \n`;
		}

		const header = `[${data.Brand} ${data.Model}](${data.Link})`;
		const category = data.Categories ? `- *${data.Categories}*` : "";

		return ctx.replyWithMarkdown(
			`${header}${category}\n\n${rows}`,
			Extra.webPreview(false)
		);
	} catch (e) {
		console.error(e);
	}
}

export default (commands) => {
	return commands.create("ssd", {
		required: true,
		helpMessage: lssd.help,
		handler: SSDCommand,
	});
};
