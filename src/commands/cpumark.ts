import { parseCPUArgs } from "./cpu";
import monk from "monk";

//done
// TODO:
// just more testing and validate with atlas
// add real cinebench results

// eslint-disable-next-line @typescript-eslint/no-var-requires
const processors = require("../../data/processors.json");

// import { connection, connectDatabase } from "../dbConnection";

// const db = monk(process.env.BENCHMARKS_DBURI);
const db = monk("localhost:27017/test");

const benchmarks = db.get("benchmarks");
benchmarks.createIndex("model hwtype benchmark");
// console.log(benchmarks);

const BENCHMARKS_ALIASES = [
    [
        "Cinebench R20 ST",
        "CBR20ST",
        "CINEBENCHR20ST",
        "CINEBENCHR20SC",
        "CINEBENCHR201T",
        "CBR201T",
        "CBR20SC",
        "CBR201C",
    ],
    [
        "Cinebench R20 Multi Thread",
        "CBR20MT",
        "CINEBENCHR20MT",
        "CINEBENCHR20MC",
        "CINEBENCHR20NT",
        "CBR20NT",
        "CBR20MT",
        "CBR20NC",
    ],
    ["GB5", "GEEKBENCH5"],
];

function getBenchmarkAlias(v) {
    const alias = BENCHMARKS_ALIASES.find((a) => a.includes(v.toUpperCase()));
    return alias && { long: alias[0], short: alias[1] };
}

function getBenchmark(args, i, skipFirst) {
    const s = skipFirst ? 1 : 0;
    const benchmark = args
        .slice(s, i - 1)
        .join("")
        .toUpperCase();

    return getBenchmarkAlias(benchmark) || benchmark;
}

// async function addCPUMarkCommand({ ctx, args }) {
//     try {
//         // addBenchmark(name, model, result, hwtype, user, source, notes) {
//         // const item = {
//         //     benchmark,
//         //     model: cpu,
//         //     result,
//         //     hwtype: "cpu",
//         //     user: ctx.message.from.username,
//         //     //TODO:
//         //     // source
//         //     // notes
//         // };
//         // const res = await benchmarks.insert(item);
//         // console.log(res);
//     } catch (e) {
//         console.error(e);
//     }
// }

async function getAverageBenchmark(model, hwtype, benchmark) {
    return (
        await benchmarks.aggregate([
            { $match: { hwtype, model, benchmark } },
            { $group: { _id: null, average: { $avg: "$result" } } },
        ])
    )[0]?.average;
}

async function getCPUMarkCommand({ ctx, args }) {
    // if (args.length < 3) {
    //     console.log("invalid args");
    //     return;
    // }

    let ni = args.length;
    let result;
    if (args[0] === "add") {
        ni = args.map((v) => isNaN(v)).lastIndexOf(false);
        result = Number(args[ni]);

        if (ni === -1) {
            console.error("Please enter result of benchmark");
            return ctx.reply("Please enter result of benchmark");
        }
    }
    const cpu = args[ni - 1];
    const benchmark = getBenchmark(args, ni, !!result);
    const [source, notes] = args.slice(ni + 1);

    console.log("query", { cpu, benchmark, result });
    console.log({ source, notes });

    const CPUData = processors.find((v) => v.Model.toLowerCase() == cpu.toLowerCase());
    if (!CPUData) {
        console.error("CPU not found");
        return ctx.reply("CPU not found");
    }
    const { Model, Line } = CPUData;
    const CPUFullName = `${Line} ${Model}`;

    try {
        // let res = await benchmarks.find({
        //     hwtype: "cpu",
        //     model: cpu,
        //     benchmark,
        // });
        // console.log(res);
        if (!result) {
            const avgResult = await getAverageBenchmark(cpu, "cpu", benchmark.short);
            console.log(avgResult);
            if (!avgResult) {
                return ctx.reply("Couldn't find benchmarks for this CPU");
            }
            return ctx.replyWithMarkdown(
                `Average *${benchmark.long}* result for *${CPUFullName}*:\n${avgResult | 0}`
            );
        }

        const item = {
            benchmark: benchmark.short,
            model: cpu,
            result,
            hwtype: "cpu",
            user: ctx.message.from.username,
            source,
            notes,
        };
        const res = await benchmarks.insert(item);
        console.log(res);

        return ctx.reply(`Benchmark added👍🏻`);
    } catch (e) {
        console.error(e);
        return ctx.reply("Couldn't add this benchmark. try again later");
    }

    // fix telegraf-encommands fix message_id
}

// // console.log("Get average :");
// CPUMarkCommand({
//     ctx: { message: { from: { username: "mhnaru" } } },
//     args: [...bmSplitted, model],
// });

export default (commands) => {
    commands.create("cpumark", {
        helpMessage: "This is help message for mark",
        parseArgsOptions: parseCPUArgs,
        handler: getCPUMarkCommand,
    });

    // commands.create("addcpumark", {
    //     helpMessage: "This is help message for mark",
    //     parseArgsOptions: parseCPUArgs,
    //     handler: addCPUMarkCommand,
    // });
};
