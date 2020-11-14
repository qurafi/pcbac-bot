import monk from "monk";
import AWS, { DynamoDB } from "aws-sdk";

if (process.env.NODE_ENV == "development") {
	AWS.config.logger = console;
}

AWS.config.update({
	region: "us-east-2",
});

export const DDB = new DynamoDB.DocumentClient();

console.log("MONGODB URI:", process.env.MONGO_DBURI);
export const MDB = monk(process.env.MONGO_DBURI);

MDB.catch((v) => console.error(v));
