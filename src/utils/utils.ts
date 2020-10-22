export function matchItem(items: Array<any>, kwords: string[]): any {
    if (!kwords.length) {
        return { state: -1 };
    }

    let match = kwords.map((arg: any) => {
        let arg_regex = new RegExp(`${arg}$`, "i");
        return items.find((v: { Model: string }) => arg_regex.test(v.Model));
    });

    let result = match.filter(Boolean);
    if (!result || result.length < kwords.length) {
        let notFound = kwords.filter((_: any, i: string | number) => !match[i]);
        return { state: 0, items: notFound };
    }

    return { state: 1, items: result };
}

export function generateTable(items, keys, fn?: Function) {
    let output = "";
    let maxL = [...keys].sort((a, b) => b[0].length - a[0].length)[0][0].length;

    for (const v of keys) {
        let k = v[0];
        // let padstr = " ".repeat(1);
        let padstr = " ";
        output += k + " ".repeat(maxL - k.length) + padstr + "|";

        let i = 0;
        for (const p of items) {
            let maxL = keys.reduce((a, b) => {
                let v = p[b[1] || b[0]];
                return v && v.length > a ? v.length : a;
            }, 0);

            let key = v[1] || v[0];
            let val = String(p[key] || "N/A");
            let n = parseFloat(val);
            let unit = val.match(/[^\d]+$/g) || "";
            val = isNaN(n) ? val : n.toString() + unit;
            if (fn) val = fn(key, val);
            output +=
                padstr +
                (val + " ".repeat(Math.max(0, maxL - val.length))) +
                (i < items.length - 1 ? " |" : "");
            i++;
        }

        output += "\n";
    }

    return output;
}
