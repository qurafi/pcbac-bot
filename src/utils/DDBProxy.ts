import { DDB } from "../ddb";

export default (TableName: string): any => {
    return new Proxy(
        {},
        {
            async get(target, k) {
                let v = Reflect.get(target, k);
                if (!v) {
                    let v = await DDB.get({
                        TableName,
                        Key: { query: k },
                    }).promise();
                    if (v && v.Item) return v;
                }
                return v;
            },

            set(target, k, v) {
                DDB.put({ TableName, Item: { query: k, message_id: v } })
                    .promise()
                    .catch((e) => console.error(e));

                return Reflect.set(target, k, v);
            },
        }
    );
};
