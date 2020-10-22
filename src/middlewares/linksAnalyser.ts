// TODO

// import { Composer, Telegraf } from "telegraf";
// import { URL } from "url";

// export default Telegraf.mount("message", (ctx, next) => {
//     let { entities, text } = ctx.message;
//     if (entities) {
//         let urls = entities
//             .filter((v) => v.type == "url")
//             .map((v) => text.slice(v.offset, v.length));
//         console.log(entities);
//         console.log(urls);
//     }
//     next();
// });
