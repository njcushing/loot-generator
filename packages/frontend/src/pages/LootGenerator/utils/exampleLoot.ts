import { Items, Tables } from "@/utils/types";
import { createItem, createLootItem, createTable, createLootTable } from "@/utils/generateLoot";
import { v4 as uuid } from "uuid";

const tableIds: Map<string, string> = new Map([
    ["Fruits", uuid()],
    ["Vegetables", uuid()],
    ["Dairy", uuid()],
]);

const itemIds: Map<string, string> = new Map([
    ["Apple", uuid()],
    ["Banana", uuid()],
    ["Orange", uuid()],
    ["Peach", uuid()],
    ["Cherry", uuid()],
    ["Broccoli", uuid()],
    ["Carrot", uuid()],
    ["Potato", uuid()],
    ["Milk", uuid()],
    ["Yoghurt", uuid()],
    ["Cheese", uuid()],
]);

export const items: Items = new Map([
    [itemIds.get("Apple")!, createItem({ name: "Apple" })],
    [itemIds.get("Banana")!, createItem({ name: "Banana" })],
    [itemIds.get("Orange")!, createItem({ name: "Orange" })],
    [itemIds.get("Peach")!, createItem({ name: "Peach" })],
    [itemIds.get("Cherry")!, createItem({ name: "Cherry" })],
    [itemIds.get("Broccoli")!, createItem({ name: "Broccoli" })],
    [itemIds.get("Carrot")!, createItem({ name: "Carrot" })],
    [itemIds.get("Potato")!, createItem({ name: "Potato" })],
    [itemIds.get("Milk")!, createItem({ name: "Milk" })],
    [itemIds.get("Yoghurt")!, createItem({ name: "Yoghurt" })],
    [itemIds.get("Cheese")!, createItem({ name: "Cheese" })],
]);

export const tables: Tables = new Map([
    [
        tableIds.get("Fruits")!,
        createTable({
            name: "Fruits",
            loot: [
                createLootItem({ id: itemIds.get("Apple"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Banana"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Orange"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Peach"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Cherry"), criteria: { weight: 10 } }),
                createLootTable({
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
                createLootItem({ id: itemIds.get("Broccoli"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Carrot"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Potato"), criteria: { weight: 10 } }),
                createLootTable({
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
                createLootItem({ id: itemIds.get("Milk"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Yoghurt"), criteria: { weight: 10 } }),
                createLootItem({ id: itemIds.get("Cheese"), criteria: { weight: 10 } }),
            ],
        }),
    ],
]);
