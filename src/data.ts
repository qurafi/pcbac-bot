import { promises as fs, readdirSync } from "fs";
import { join, basename } from "path";

const dataPath = "./data";
const files = readdirSync(dataPath);

const loadData = async () => {
	try {
		const data = {};

		for (const file of files) {
			const contents = await fs.readFile(join(dataPath, file), "utf-8");
			data[basename(file, "json")] = JSON.parse(contents);
		}

		return data;
	} catch (e) {
		console.error(e);
	}
};

export default loadData;
