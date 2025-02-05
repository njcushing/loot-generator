import * as uuid from "uuid";
import { vi } from "vitest";
import { Items, Tables } from "@/utils/types";
import {
    createLootEntry,
    createTable,
    createLootTable,
    createItem,
    createLootItem,
    generateLoot,
} from ".";

// Mock dependencies
const mockItems: Items = {
    apple: {
        name: "Apple",
        value: 10,
        custom: {},
    },
    banana: {
        name: "Banana",
        value: 100,
        custom: {},
    },
    cherry: {
        name: "Cherry",
        value: 1000,
        custom: {},
    },
};

const mockTables: Tables = {
    fruits: {
        name: "Fruits",
        loot: [
            {
                key: "apple",
                type: "item_id",
                id: "apple",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "banana",
                type: "item_id",
                id: "banana",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "vegetables",
                type: "table_id",
                id: "vegetables",
                criteria: { weight: 1 },
            },
            {
                key: "carbohydrates",
                type: "table_noid",
                name: "Carbohydrates",
                loot: [
                    {
                        key: "cherry",
                        type: "item_id",
                        id: "cherry",
                        quantity: { min: 1, max: 1 },
                        criteria: { weight: 1 },
                    },
                ],
                custom: {},
                criteria: { weight: 1 },
            },
            {
                key: "pineapple",
                type: "item_noid",
                name: "pineapple",
                value: 90,
                custom: {},
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "loot-entry-key",
                type: "entry",
            },
        ],
        custom: {},
    },
    vegetables: {
        name: "Vegetables",
        loot: [],
        custom: {},
    },
};

const mockRandomRange = vi.fn((min, max) => Math.min(min, max));
vi.mock("@/utils/randomRange", () => ({
    randomRange: vi.fn(({ min, max }) => mockRandomRange(min, max)),
}));

describe("The createLootEntry function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should return a new LootEntry object, with a randomly-generated string for the 'key' field", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createLootEntry();

        expect(result).toStrictEqual({
            type: "entry",
            key: "randomly-generated-key",
        });
    });
    test("Using existing properties where provided", () => {
        const result = createLootEntry({ key: "entry-key" });

        expect(result).toStrictEqual({
            type: "entry",
            key: "entry-key",
        });
    });
    test("Should not add any fields to the LootEntry object that shouldn't be present on an object of this type", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        const result = createLootEntry({ key: "entry-key", loot: [] });

        expect(result).toStrictEqual({
            type: "entry",
            key: "entry-key",
        });
    });
});

describe("The createTable function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should return a new Table object", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createTable();

        expect(result).toStrictEqual({
            name: "",
            loot: [],
            custom: {},
        });
    });
    test("Using existing properties where provided", () => {
        const result = createTable({ name: "table" });

        expect(result).toStrictEqual({
            name: "table",
            loot: [],
            custom: {},
        });
    });
    test("Should not add any fields to the Table object that shouldn't be present on an object of this type", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        const result = createTable({ name: "table", key: "" });

        expect(result).toStrictEqual({
            name: "table",
            loot: [],
            custom: {},
        });
    });
});

describe("The createLootTable function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should return a new id LootTable object, with a randomly-generated string for the 'key' field", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createLootTable("table_id");

        expect(result).toStrictEqual({
            type: "table_id",
            key: "randomly-generated-key",
            id: null,
            criteria: {
                weight: 1,
                rolls: {},
            },
        });
    });
    test("Should return a new noid LootTable object, with a randomly-generated string for the 'key' field, appending the result of the 'createTable' function to the returned object", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createLootTable("table_noid");

        expect(result).toStrictEqual({
            type: "table_noid",
            key: "randomly-generated-key",
            criteria: {
                weight: 1,
                rolls: {},
            },
            ...createTable(),
        });
    });
    test("Using existing properties where provided for id LootTables", () => {
        const result = createLootTable("table_id", {
            key: "table-key",
            id: "table",
            criteria: {
                weight: 10,
                rolls: {},
            },
        });

        expect(result).toStrictEqual({
            type: "table_id",
            key: "table-key",
            id: "table",
            criteria: {
                weight: 10,
                rolls: {},
            },
        });
    });
    test("Using existing properties where provided for noid LootTables", () => {
        const result = createLootTable("table_noid", {
            key: "table-key",
            criteria: {
                weight: 10,
                rolls: {},
            },
        });

        expect(result).toStrictEqual({
            type: "table_noid",
            key: "table-key",
            criteria: {
                weight: 10,
                rolls: {},
            },
            ...createTable(),
        });
    });
    test("Should not add any fields to the LootTable object that shouldn't be present on an object of this type", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        const result = createLootTable("table_id", { key: "table-key", id: "table", loot: [] });

        expect(result).toStrictEqual({
            type: "table_id",
            key: "table-key",
            id: "table",
            criteria: {
                weight: 1,
                rolls: {},
            },
        });
    });
});

describe("The createItem function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should return a new Item object", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createItem();

        expect(result).toStrictEqual({
            name: "",
            sprite: undefined,
            value: 1,
            custom: {},
        });
    });
    test("Using existing properties where provided", () => {
        const result = createItem({ name: "item", sprite: "", value: 10, custom: {} });

        expect(result).toStrictEqual({
            name: "item",
            sprite: "",
            value: 10,
            custom: {},
        });
    });
    test("Should not add any fields to the Item object that shouldn't be present on an object of this type", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        const result = createItem({ name: "item", key: "" });

        expect(result).toStrictEqual({
            name: "item",
            sprite: undefined,
            value: 1,
            custom: {},
        });
    });
});

describe("The createLootItem function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should return a new id LootItem object, with a randomly-generated string for the 'key' field", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createLootItem("item_id");

        expect(result).toStrictEqual({
            type: "item_id",
            key: "randomly-generated-key",
            id: null,
            criteria: {
                weight: 1,
                rolls: {},
            },
            quantity: {
                min: 1,
                max: 1,
            },
        });
    });
    test("Should return a new noid LootItem object, with a randomly-generated string for the 'key' field, appending the result of the 'createItem' function to the returned object", () => {
        vi.spyOn(uuid, "v4").mockReturnValueOnce("randomly-generated-key");

        const result = createLootItem("item_noid");

        expect(result).toStrictEqual({
            type: "item_noid",
            key: "randomly-generated-key",
            criteria: {
                weight: 1,
                rolls: {},
            },
            quantity: {
                min: 1,
                max: 1,
            },
            ...createItem(),
        });
    });
    test("Using existing properties where provided for id LootItems", () => {
        const result = createLootItem("item_id", {
            key: "item-key",
            id: "item",
            criteria: {
                weight: 10,
                rolls: {},
            },
            quantity: {
                min: 10,
                max: 10,
            },
        });

        expect(result).toStrictEqual({
            type: "item_id",
            key: "item-key",
            id: "item",
            criteria: {
                weight: 10,
                rolls: {},
            },
            quantity: {
                min: 10,
                max: 10,
            },
        });
    });
    test("Using existing properties where provided for noid LootItems", () => {
        const result = createLootItem("item_noid", {
            key: "item-key",
            criteria: {
                weight: 10,
                rolls: {},
            },
            quantity: {
                min: 10,
                max: 10,
            },
        });

        expect(result).toStrictEqual({
            type: "item_noid",
            key: "item-key",
            criteria: {
                weight: 10,
                rolls: {},
            },
            quantity: {
                min: 10,
                max: 10,
            },
            ...createItem(),
        });
    });
    test("Should not add any fields to the LootItem object that shouldn't be present on an object of this type", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        const result = createLootItem("item_id", { key: "item-key", id: "item", loot: [] });

        expect(result).toStrictEqual({
            type: "item_id",
            key: "item-key",
            id: "item",
            criteria: {
                weight: 1,
                rolls: {},
            },
            quantity: {
                min: 1,
                max: 1,
            },
        });
    });
});

describe("The generateLoot function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should return the input loot object if the 'active' argument is falsy", () => {
        expect(generateLoot(null, mockTables, mockItems, 1, {})).toStrictEqual({});
    });
    test("Should return the input loot object if the 'tables' argument is falsy", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        expect(generateLoot("fruits", null, mockItems, 1, {})).toStrictEqual({});
    });
    test("Should return the input loot object if the 'items' argument is falsy", () => {
        // @ts-expect-error - Disabling type checking for mocking props in unit test
        expect(generateLoot("fruits", mockTables, null, 1, {})).toStrictEqual({});
    });
    test("Should return the input loot object if the 'active' argument doesn't refer to a valid table in the 'tables' argument object", () => {
        expect(generateLoot("invalid-table", mockTables, mockItems, 1, {})).toStrictEqual({});
    });
    test("Should return a new loot object containing the generated loot", () => {
        for (let i = 0; i < 10; i++) {
            vi.spyOn(global.Math, "random").mockReturnValueOnce(0.1 * i);
        }

        const result = generateLoot("fruits", mockTables, mockItems, 10, {});
        expect(Object.keys(result).length).toBeGreaterThan(0);
    });
});
