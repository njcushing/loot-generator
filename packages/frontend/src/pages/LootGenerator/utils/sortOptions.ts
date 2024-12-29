import { SortOptions } from "@/utils/types";

export const sortOptions: SortOptions = new Map([
    ["name", new Map([["order", { selected: "ascending", values: ["ascending", "descending"] }]])],
    [
        "quantity",
        new Map([["order", { selected: "descending", values: ["ascending", "descending"] }]]),
    ],
    [
        "value",
        new Map([
            ["order", { selected: "descending", values: ["ascending", "descending"] }],
            ["summation", { selected: "total", values: ["individual", "total"] }],
        ]),
    ],
]);
