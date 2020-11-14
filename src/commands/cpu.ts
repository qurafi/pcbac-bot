import { Extra } from "telegraf";
import { getCPUPrice } from "./amazon";
import { matchItem, generateTable } from "../utils/utils";

const locale = require("../../localization.json");
const lc = locale.CPU;

const processors = require("../../data/processors.json");
const isCPULineup = (v) => /(r|i|a)\d?$/gi.test(v);
const CPU_BRANDS = /amd|intel|ryzen(\s?)(\d?(?![^\s]))|athlon|core|xeon|threadripper/gi;

const CPU_KEYS = [
	["Process", "Lithography"],
	["Base  CLK", "BaseFrequency"],
	["Boost CLK", "BoostFrequency"],
	["Cores"],
	["Threads"],
	["Cache", "TotalCache"],
	["TDP"],
	["Socket"],
	["Year", "Date"],
	["Price"],
];

const UNITS = {
	Lithography: "nm",
	TotalCache: "MB",
	BaseFrequency: "GHz",
	BoostFrequency: "GHz",
	TDP: "W",
};

export const parseCPUArgs = {
	preParse: (query: string): string => {
		return query.replace(CPU_BRANDS, "");
	},
	postParse: (queries: string[]): string[] => {
		return queries.map((v, i, arr) => {
			const last = arr[i - 1];
			if (!isCPULineup(v)) return v;
			if (last && isCPULineup(last)) return `${last}-${v}`;
		});
	},
};

function addUnits(k, v) {
	const u = UNITS[k];
	if (k == "TotalCache") v = Math.round(v);
	if (u) v += u;
	if (k == "Date") v = "20" + v;
	return v;
}

function generateCPUTable(items) {
	let text = generateTable({
		items,
		keys: CPU_KEYS,
		format: addUnits,
	});

	const links = items.map((v) => {
		return `[${v.Line} ${v.Model}](${v.Link})`;
	});

	const chipsets = items[0].Chipset;
	if (items.length === 1 && chipsets) {
		text += `\n${lc.SUPPORTED_MOTHERBOARDS}:\n\t ${chipsets}`;
	}

	return `${links.join("  *vs*  ")}\n\n\`${text}\`⠀`;
}

async function CPUCommand({ ctx, args }) {
	let items = matchProcessor(args) as any;

	if (typeof items === "string") {
		ctx.replyWithMarkdown(items);
		return;
	}

	items = items.slice(0, 3);

	const models = items.map((v) => `${v.Line} ${v.Model}`);
	const prices = await getCPUPrice(models);

	prices.forEach((v) => {
		const { Price, Model } = v;
		const item = items.find((v) => Model.endsWith(v.Model));
		if (Price && item) {
			item.Price = "$" + Math.round(Price.slice(1));
		}
	});

	const table = generateCPUTable(items);
	return ctx.replyWithMarkdown(table, Extra.webPreview(false));
}

export function matchProcessor(args, noMessage = false) {
	const { state, items, notFound } = matchItem(processors, args);

	if (state < 1 && !noMessage) {
		let message = `*${locale.NO_MATCH}`;

		if (notFound && args.length > 1 && notFound.length > 0) {
			message += ` ${lc.NO_MATCH_LIST} :* ${notFound.join(", ")}`;
		} else {
			message += "*";
		}

		return message;
	}

	return [...new Set(items)].sort();
}

export default (commands) => {
	return commands.create("cpu", {
		required: true,
		helpMessage: lc.help,
		parserOptions: parseCPUArgs,
		handler: CPUCommand,
	});
};
