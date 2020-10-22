import { parseCPUArgs } from "./cpu";
import { matchItem } from "../utils/utils";
import { DDB } from "../ddb";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const processors = require("../../data/processors.json");
// TODO: CHANGE TABLE FOR PRODUCTION
const tableName = "processors-prices-prod";
const amazonURL = "amazon.com/dp/";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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

async function AmazonCommand({ ctx, args, query }) {
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
    const data = await getCPUPrice(models);
    const text = data.map((v) => `${v.Model} - ${v.Price || "N/A"} - ${amazonURL}${v.Link}`);

    return ctx.reply(text.join("\n"));
}

export default (commands): void => {
    commands.create("amazon", {
        helpMessage: "This is help message for amazon",
        parseArgsOptions: parseCPUArgs,
        handler: AmazonCommand,
    });
};
