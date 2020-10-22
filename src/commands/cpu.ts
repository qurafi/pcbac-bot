import { matchItem, generateTable } from "../utils/utils";
import { Extra } from "telegraf";
import { getCPUPrice } from "./amazon";
// import * as processors from "../../../data/processors.json";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const processors = require("../../data/processors.json");

const isCPULineup = (v) => /(r|i|a)\d?$/gi.test(v);
const CPU_BRANDS = /amd|intel|ryzen(\s?)(\d?)|athlon|core|xeon|threadripper/gi;

const CPU_KEYS = [
    ["Process", "Lithography"],
    ["Base CLK", "BaseFrequency"],
    ["Boost CLK", "BoostFrequency"],
    ["Cores"],
    ["Threads"],
    ["Cache", "TotalCache"],
    ["TDP"],
    ["Socket"],
    ["Year", "Date"],
    ["Price", "Price"],
];

const UNITS = {
    Lithography: "nm",
    TotalCache: "MB",
    BaseFrequency: "GHz",
    BoostFrequency: "GHz",
    TDP: "W",
};

export const parseCPUArgs = {
    preProcess: (query: string): string => query.replace(CPU_BRANDS, ""),
    postProcess: (queries: string[]): string[] => {
        return queries.map((v, i, arr) => {
            const last = arr[i - 1];
            if (!isCPULineup(v)) return v;
            if (last && isCPULineup(last)) return `${last}-${v}`;
        });
    },
};

function generateCPUTable(items) {
    let text = generateTable(items, CPU_KEYS, (k, v) => {
        const u = UNITS[k];
        if (u) v += u;
        if (k == "Date") v = "20" + v;
        return v;
    });
    const sep = " ".repeat(5);
    const links = items.map((v) => {
        return `[${v.Line} ${v.Model}](${v.Link})`;
    });

    const chipsets = items[0].Chipset;
    if (items.length === 1 && chipsets) {
        text += `\nSupported Motherboards:\n\t ${chipsets}`;
    }

    return `${links.join(sep + "*vs*" + sep)}\n\n\`${text}\`⠀`;
}

async function CPUCommand({ ctx, args, query }) {
    console.log({ args, query });
    const { state, items } = matchItem(processors, args);

    if (state < 1) {
        let message = "*No matches";

        if (items && items.length > 0) {
            message += ` for :* ${items.join(", ")}`;
        } else {
            message += "*";
        }

        return ctx.replyWithMarkdown(message);
    }

    const models = items.map((v) => `${v.Line} ${v.Model}`);
    const prices = await getCPUPrice(models);
    items.forEach((v, i) => {
        const price = prices[i]?.Price;
        if (price) v.Price = price;
    });

    console.log(models);

    const table = generateCPUTable(items);
    return ctx.replyWithMarkdown(table, Extra.webPreview(false));
}

export default (commands) => {
    commands.create("cpu", {
        helpMessage: "This is help message for cpu",
        parseArgsOptions: parseCPUArgs,
        handler: CPUCommand,
    });
};
