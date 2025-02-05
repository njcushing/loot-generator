import * as uuid from "uuid";
import { vi } from "vitest";
import { createLootEntry, createTable, createLootTable, createItem, createLootItem } from ".";

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
    test("Using existing properties where provided", () => {
        const result = createLootTable("table_id", { key: "table-key", id: "table" });

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
        const result = createItem({ name: "item" });

        expect(result).toStrictEqual({
            name: "item",
            sprite: undefined,
            value: 1,
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
    test("Using existing properties where provided", () => {
        const result = createLootItem("item_id", { key: "item-key", id: "item" });

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
