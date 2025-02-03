import "@testing-library/jest-dom";
import { LootGeneratorState } from "@/pages/LootGenerator";
import { findCompatibleDescendantTables } from ".";

const mockTables: LootGeneratorState["tables"] = {
    tableA: {
        name: "Table A",
        loot: [
            {
                key: "table-B-key",
                type: "table_id",
                id: "tableB",
                criteria: { weight: 1 },
            },
        ],
        custom: {},
    },
    tableB: {
        name: "Table B",
        loot: [
            {
                key: "table-noid-key",
                type: "table_noid",
                name: "table_noid",
                loot: [
                    {
                        key: "table-E-key",
                        type: "table_id",
                        id: "tableE",
                        criteria: { weight: 1 },
                    },
                ],
                custom: {},
                criteria: { weight: 1 },
            },
        ],
        custom: {},
    },
    tableC: {
        name: "Table C",
        loot: [
            {
                key: "table-D-key",
                type: "table_id",
                id: "tableD",
                criteria: { weight: 1 },
            },
        ],
        custom: {},
    },
    tableD: {
        name: "Table D",
        loot: [],
        custom: {},
    },
    tableE: {
        name: "Table E",
        loot: [
            {
                key: "table-C-key",
                type: "table_id",
                id: "tableC",
                criteria: { weight: 1 },
            },
        ],
        custom: {},
    },
};

describe("The findCompatibleDescendantTables function...", () => {
    test("Should return a Set containing the keys of all compatible descendant tables for a specified table", () => {
        const result = findCompatibleDescendantTables("tableC", mockTables);

        expect(result instanceof Set).toBeTruthy();
        expect([...result.keys()]).toStrictEqual(["tableD"]);
    });
});
