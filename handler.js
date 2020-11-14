"use strict";
const { bot } = require("./dist/bot");
module.exports.bot = async (event) => {
	console.log("new update");
	await bot.handleUpdate(JSON.parse(event.body));
	console.log("after update");
	await new Promise((res) => setTimeout(res, 1000));
	return {
		statusCode: 200,
		body: "",
	};
};
