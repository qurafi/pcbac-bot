import { Extra } from "telegraf";
import { parseCPUArgs } from "./cpu";
import { format, escapeRegex } from "../utils/utils";
import { MDB } from "../ddb";
import BENCHMARKS_ALIASES from "./benchmarks-aliases";

const processors = require("../../data/processors.json");
const locale = require("../../localization.json");
const bml = locale.BENCHMARK;

const benchmarks = MDB.get("benchmarks");
benchmarks.createIndex("model hwtype benchmark");

function getBenchmarkAlias(v) {
	const alias = BENCHMARKS_ALIASES.find((a) => a.includes(v.toLowerCase()));
	return alias || [v, v];
}

async function sendBenchmarkResult(ctx, bm, hwtype, m) {
	const bmregex = new RegExp(escapeRegex(bm[1]));

	const _models = m.split(" vs ").map((v) => escapeRegex(v));
	if (_models[0].length < 3) {
		ctx.reply(bml.notFound);
		return;
	}
	const models_regex = _models.map((v) => {
		v = escapeRegex(v);
		if (hwtype == "gpu") {
			v = v.replace(/(\d+) *([a-z]{2}$)/gi, (_, p1, p2) => `${p1} *${p2}`);

			v = v.replace(/(rt*x|gtx*)(\d{3,})/gi, (_, p1, p2) => `${p1} *${p2}`);

			v = v.replace(/((20|16)\d{2})S/gi, "$1 super");

			v += "(?! *(super|ti|xt))";
		} else {
			//cpu
			v += "(?=\\s|$)";
		}

		return new RegExp(v, "i");
	});

	console.log({ bmregex, models_regex });

	const query = {
		model: { $in: models_regex },
		benchmark: { $regex: bmregex },
		hwtype,
	};
	const res = await benchmarks.find(query, { raw: false, sort: { result: -1 } });
	console.log({ res });
	if (!Array.isArray(res) || res.length === 0) {
		ctx.reply(bml.notFound);
		return;
	}

	const rows = res.map((v) => {
		const { result, source, model } = v;
		let name;
		if (hwtype === "gpu") {
			name = model.toUpperCase().replace(/(geforce|radeon) */gi, "");
		} else {
			//cpu
			name = getCPUFullName(model) || model;
		}
		return `[${name}](${source || ""}) - *${result | 0}*`;
	});

	const text = `*${bm[0]}*\n${rows.join("\n")}`;
	return ctx.replyWithMarkdown(text, Extra.webPreview(false));
}

function getCPUFullName(cpu) {
	const CPUData = processors.find((v) => {
		return v.Model.toLowerCase() === cpu;
	});

	if (CPUData) return `${CPUData.Line} ${CPUData.Model}`;
}

async function getBenchmarkCommand({ ctx, args, command }) {
	try {
		if (!args || args.length < 2) {
			ctx.reply(locale.INVALID_ARGS);
			return;
		}

		const si = args.findIndex((v) => {
			return BENCHMARKS_ALIASES.findIndex((a) => a.includes(v.toLowerCase())) > -1;
		});

		if (si < 0) {
			ctx.reply(bml.noName);
			return;
		}

		const hwtype = command.slice(0, 3);
		const bench = args.slice(si).join("").toLowerCase();
		const models = args.slice(0, si).join(" ").toLowerCase();
		const benchmark = getBenchmarkAlias(bench);
		return sendBenchmarkResult(ctx, benchmark, hwtype, models);
	} catch (e) {
		console.error(e);
		ctx.reply(bml.error);
	}
}

const commandOptions = {
	required: true,
	allowEdited: false,
	helpMessage: format(bml.help, "`model benchmark_name`"),
	parserOptions: parseCPUArgs,
	handler: getBenchmarkCommand,
};

export default (commands) => {
	commands.create("cpumark", commandOptions);
	commands.create("gpumark", commandOptions);
};
