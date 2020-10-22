export interface parseArgsOptions {
    maxargs?: 2;
    removeDups?: true;
    preProcess?: Function;
    postProcess?: Function;
}

export function parseArgs(query, options: parseArgsOptions = {}) {
    if (options.preProcess) {
        let returned = options.preProcess(query);
        if (typeof returned == "string") {
            query = returned;
        }
    }

    query = query.trim().split(" ", options.maxargs);

    if (options.postProcess) {
        let returned = options.postProcess(query);
        if (typeof returned == "string") {
            query = returned;
        }
    }

    // remove any empty string
    query = query.filter(Boolean);

    if (options.removeDups) {
        query = [...new Set(query)];
    }

    return query;
}

// function parseArgs(command, query, maxargs = 2) {
//     let isCPU = command == "cpu";
//     let queries = query
//         .slice(command.length + 2)
//         .replace(CPU_BRANDS, "")
//         // .replace(isCPU ? CPU_BRANDS : GPU_BRANDS, "")
//         .trim()
//         .split(" ", maxargs)

//     if (isCPU) {
//         queries = queries.map((v, i, arr) => {
//             let last = arr[i - 1];
//             if (!isCPULineup(v)) return v;
//             if (last && isCPULineup(last)) return `${last}-${v}`;
//         })
//     }

//     queries = queries.filter(Boolean);
//     return [...new Set(queries)];
// }
