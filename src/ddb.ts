import AWS, { DynamoDB } from "aws-sdk";
AWS.config.logger = console;
AWS.config.update({ region: "us-east-2" });

export const DDB = new DynamoDB.DocumentClient();
