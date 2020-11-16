type item = Record<string, string | number>;
interface matchReturn {
	state: number;
	items?: item[];
	notFound?: string[];
}

export function matchItem(items: Array<item>, kwords: string[]): matchReturn {
	if (!kwords.length) return { state: 0 };

	const match = kwords.map((arg: string) => {
		const arg_regex = new RegExp(`${arg}$`, "i");
		return items.find((v: { Model: string }) => arg_regex.test(v.Model));
	});

	const result = match.filter(Boolean);
	let notFound;
	if (!result || result.length < kwords.length) {
		notFound = kwords.filter((v: string, i: string | number) => !match[i]);
	}

	return { state: notFound ? 0 : 1, items: result, notFound };
}

type Format = (k: string, v: string) => string;

interface gTableParams {
	items: Array<item>;
	keys: string[][];
	format?: Format;
	spacing?: number;
}

function getMaxLength(arr) {
	arr = arr.map((v) => v.length);
	return arr.reduce((a, v) => (v > a ? v : a), 0);
}

function formatValue(key, val, format?: Format) {
	val = String(val || "N/A");

	const n = parseFloat(val);
	const unit = val.match(/[^\d]+$/g) || "";

	val = isNaN(n) ? val : n.toString() + unit;
	if (format) val = format(key, val);

	return val;
}

export function generateTable({ items, keys, format, spacing }: gTableParams) {
	const maxHeaderPad = getMaxLength(keys.map((v) => v[0]));
	const padstr = " ".repeat(spacing || 0);

	let output = "";
	for (const key of keys) {
		const headerPad = " ".repeat(maxHeaderPad - key[0].length) + padstr;

		output += key[0] + headerPad + " |";

		const dkey = key[1] || key[0];

		for (let i = 0; i < items.length; i++) {
			const p = items[i];
			const value = formatValue(dkey, p[dkey], format);
			const pvalues = keys.map((k) => {
				const dk = k[1] || k[0];
				return formatValue(dk, p[dk], format);
			});
			const maxPad = getMaxLength(pvalues);
			const pad = " ".repeat(Math.max(0, maxPad - value.length));
			const right = i < items.length - 1 ? padstr + "|" : "";

			output += padstr + value + pad + right;
		}

		output += "\n";
	}

	return output;
}

export function escapeRegex(s) {
	return s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

export function format(s, ...args) {
	return s.replace(/%(\d+)/g, (m, i) => {
		return args[i - 1] || m;
	});
}
