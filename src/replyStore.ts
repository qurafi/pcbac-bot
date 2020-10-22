import DDBProxy from "./utils/DDBProxy";
import { Extra } from "telegraf";
let messageStore = DDBProxy("bot-replies");

(async () => {
    let v = await messageStore.Hello;
    console.log(v);
})();

export default (fn) => {
    return (params) => {
        const { args, ctx } = params;
        let commandID = args.join();
        messageStore[commandID].then((oldMessage) => {
            if (oldMessage) {
                return ctx.reply(".", Extra.inReplyTo(oldMessage));
            }
        });
    };
};
