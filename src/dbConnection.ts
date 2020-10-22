import monk from "monk";

// const
export let connection;

export async function connectDatabase() {
    if (connection) {
        return Promise.resolve(connection);
    }
    connection = await monk(process.env.BENCHMARKS_DBURI);
    return connection;
}
