const fs = require("fs");
const escapeRegex = require("escape-string-regexp");

const ptlist = fs.readFileSync("data/psutierlist.txt", "utf-8");

const vendors = [];
const vregex = /• (.*) \|/g;

for (const v of ptlist.matchAll(vregex)) {
	const brands = v[1].toLowerCase().split(" / ");
	brands.forEach((b) => {
		if (b == "be quiet!") b = b.slice(0, -1);
		if (!vendors.includes(b)) vendors.push(b);
	});
}

vendors.sort();

const vrregex = vendors.join("|");
const vcregex = new RegExp(`^\\b(${vrregex})\\b\\s?`, "gi");

export function getPSUTier(brand, model) {
	const br = escapeRegex(brand);
	const mr = escapeRegex(model);
	const rg = new RegExp(`${br}.*\\|(.*)(\\b${mr}\\b)`, "gi");
	const m = ptlist.matchAll(rg);
	const tiers = [];
	if (m) {
		for (const v of m) {
			const i = v.index;
			const ti = ptlist.lastIndexOf("Tier", i);
			let ni = ptlist.lastIndexOf("\n(", i) + 1;
			if (ni <= ti) ni = -1;

			let notes = "";
			if (ni > 0) {
				notes = ptlist.slice(ni + 2, ptlist.indexOf("\n", ni) - 3);
			}

			const tier = ptlist.slice(ti, ptlist.indexOf("\n", ti) - 1);
			const info = {
				model: ptlist.slice(i, ptlist.indexOf("\n", i) - 1),
				tier,
				notes,
			};

			tiers.push(info);
		}
	}
	return tiers;
}

function PSUCommand({ ctx, query, args }) {
	query = query.toLowerCase();

	let brand;
	let model = query.replace(vcregex, (m) => {
		brand = m;
		return "";
	});

	if (!model) model = "units";

	if (!brand) {
		ctx.reply("Please enter full psu model");
		return;
	}

	const matchedPSU = getPSUTier(brand, model);
	if (!matchedPSU || matchedPSU.length === 0) {
		ctx.reply("PSU not found");
		return;
	}

	let text = "";

	// eslint-disable-next-line prefer-const
	for (let { model: mdl, tier, notes } of matchedPSU) {
		text += `\n*${tier.replace("Recommended ", "")}:*\n`;

		const i = mdl.toLowerCase().search(model.toLowerCase());
		const ei = mdl.indexOf(" -", i);
		mdl = mdl.slice(model == "units" ? 0 : i, ei < 0 ? mdl.length : ei);

		args.forEach((v) => {
			const r = new RegExp(escapeRegex(v), "i");
			mdl = mdl.replace(r, "*$&*");
		});

		text += "- " + mdl;
		if (notes) text += `\nNOTES:\t${notes}`;

		text += "\n";
	}

	return ctx.replyWithMarkdown(text);
}

export default (commands) => {
	return commands.create("psu", {
		required: true,
		helpMessage: "Please enter psu model",
		handler: PSUCommand,
	});
};
