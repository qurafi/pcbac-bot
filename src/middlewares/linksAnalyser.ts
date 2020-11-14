import { Telegraf } from "telegraf";
import { MDB } from "../ddb";

const links = MDB.get("links");

function parseURL(url) {
	url = url.replace(/http(s*):\/\//, "");
	const di = url.lastIndexOf(".");
	const host = url.slice(0, di);
	return { url, host };
}

export default Telegraf.mount("message", (ctx, next) => {
	const { entities, text } = ctx.message;
	if (entities) {
		const urls = entities
			.filter((v) => v.type == "url" || v.type == "text_link")
			.map((v) => v.url || text.slice(v.offset, v.offset + v.length));

		const docs = urls.map((v) => parseURL(v));
		console.log({ docs });

		if (docs && docs.length > 0) links.insert(docs);
	}
	next();
});
