import { SortOptions } from "@/utils/types";

export const sortOptions: SortOptions = [
    {
        name: "name",
        criteria: [{ name: "order", selected: "ascending", values: ["ascending", "descending"] }],
    },
    {
        name: "quantity",
        criteria: [{ name: "order", selected: "descending", values: ["ascending", "descending"] }],
    },
    {
        name: "value",
        criteria: [
            { name: "order", selected: "ascending", values: ["ascending", "descending"] },
            { name: "summation", selected: "total", values: ["individual", "total"] },
        ],
    },
];
