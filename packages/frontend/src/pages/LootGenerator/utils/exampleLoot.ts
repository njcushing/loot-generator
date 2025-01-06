import { Items, Tables } from "@/utils/types";
import { createItem, createLootItem, createTable, createLootTable } from "@/utils/generateLoot";
import { v4 as uuid } from "uuid";

const tableIds: Map<string, string> = new Map([
    ["Fruits", uuid()],
    ["Vegetables", uuid()],
    ["Dairy", uuid()],
]);

const itemIds = {
    Apple: uuid(),
    Banana: uuid(),
    Orange: uuid(),
    Peach: uuid(),
    Cherry: uuid(),
    Broccoli: uuid(),
    Carrot: uuid(),
    Potato: uuid(),
    Milk: uuid(),
    Yoghurt: uuid(),
    Cheese: uuid(),
};

export const items: Items = {};
items[itemIds["Apple"]] = createItem({ name: "Apple" });
items[itemIds["Banana"]] = createItem({ name: "Banana" });
items[itemIds["Orange"]] = createItem({ name: "Orange" });
items[itemIds["Peach"]] = createItem({ name: "Peach" });
items[itemIds["Cherry"]] = createItem({ name: "Cherry" });
items[itemIds["Broccoli"]] = createItem({ name: "Broccoli" });
items[itemIds["Carrot"]] = createItem({ name: "Carrot" });
items[itemIds["Potato"]] = createItem({ name: "Potato" });
items[itemIds["Milk"]] = createItem({ name: "Milk" });
items[itemIds["Yoghurt"]] = createItem({ name: "Yoghurt" });
items[itemIds["Cheese"]] = createItem({ name: "Cheese" });

export const tables: Tables = new Map([
    [
        tableIds.get("Fruits")!,
        createTable({
            name: "Fruits",
            loot: [
                createLootItem("item_id", { id: itemIds["Apple"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Banana"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Orange"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Peach"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Cherry"], criteria: { weight: 10 } }),
                createLootTable("table_id", {
                    id: tableIds.get("Vegetables"),
                    criteria: {
                        weight: 100,
                    },
                }),
            ],
        }),
    ],
    [
        tableIds.get("Vegetables")!,
        createTable({
            name: "Vegetables",
            loot: [
                createLootItem("item_id", {
                    id: itemIds["Broccoli"],
                    criteria: { weight: 10 },
                }),
                createLootItem("item_id", { id: itemIds["Carrot"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Potato"], criteria: { weight: 10 } }),
                createLootTable("table_id", {
                    id: tableIds.get("Dairy"),
                    criteria: {
                        weight: 100,
                    },
                }),
            ],
        }),
    ],
    [
        tableIds.get("Dairy")!,
        createTable({
            name: "Dairy",
            loot: [
                createLootItem("item_id", { id: itemIds["Milk"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Yoghurt"], criteria: { weight: 10 } }),
                createLootItem("item_id", { id: itemIds["Cheese"], criteria: { weight: 10 } }),
            ],
        }),
    ],
]);
