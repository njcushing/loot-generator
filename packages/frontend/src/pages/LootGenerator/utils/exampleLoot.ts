import { Items, LootTable } from "@/utils/types";
import { createItem, createLootItem, createLootTable } from "@/utils/generateLoot";
import { v4 as uuid } from "uuid";

const itemIds: Map<string, string> = new Map([
    ["Apple", uuid()],
    ["Banana", uuid()],
    ["Orange", uuid()],
    ["Peach", uuid()],
    ["Cherry", uuid()],
    ["Pineapple", uuid()],
    ["Kiwi", uuid()],
    ["Watermelon", uuid()],
    ["Lemon", uuid()],
    ["Lime", uuid()],
    ["Passionfruit", uuid()],
]);

export const items: Items = new Map([
    [itemIds.get("Apple")!, createItem({ name: "Apple" })],
    [itemIds.get("Banana")!, createItem({ name: "Banana" })],
    [itemIds.get("Orange")!, createItem({ name: "Orange" })],
    [itemIds.get("Peach")!, createItem({ name: "Peach" })],
    [itemIds.get("Cherry")!, createItem({ name: "Cherry" })],
    [itemIds.get("Pineapple")!, createItem({ name: "Pineapple" })],
    [itemIds.get("Kiwi")!, createItem({ name: "Kiwi" })],
    [itemIds.get("Watermelon")!, createItem({ name: "Watermelon" })],
    [itemIds.get("Lemon")!, createItem({ name: "Lemon" })],
    [itemIds.get("Lime")!, createItem({ name: "Lime" })],
    [itemIds.get("Passionfruit")!, createItem({ name: "Passionfruit" })],
]);

export const table: LootTable = createLootTable({
    props: {
        loot: [
            createLootItem({ id: itemIds.get("Apple"), criteria: { weight: 10 } }),
            createLootItem({ id: itemIds.get("Banana"), criteria: { weight: 10 } }),
            createLootItem({ id: itemIds.get("Orange"), criteria: { weight: 10 } }),
            createLootItem({ id: itemIds.get("Peach"), criteria: { weight: 10 } }),
            createLootItem({ id: itemIds.get("Cherry"), criteria: { weight: 10 } }),
            createLootTable({
                props: {
                    loot: [
                        createLootItem({ id: itemIds.get("Pineapple"), criteria: { weight: 10 } }),
                        createLootItem({ id: itemIds.get("Kiwi"), criteria: { weight: 10 } }),
                        createLootItem({ id: itemIds.get("Watermelon"), criteria: { weight: 10 } }),
                        createLootTable({
                            props: {
                                loot: [
                                    createLootItem({
                                        id: itemIds.get("Lemon"),
                                        criteria: { weight: 10 },
                                    }),
                                    createLootItem({
                                        id: itemIds.get("Lime"),
                                        criteria: { weight: 10 },
                                    }),
                                    createLootItem({
                                        id: itemIds.get("Passionfruit"),
                                        criteria: { weight: 10 },
                                    }),
                                ],
                            },
                            criteria: {
                                weight: 100,
                            },
                        }),
                    ],
                },
                criteria: {
                    weight: 100,
                },
            }),
        ],
    },
    criteria: {
        weight: 100,
    },
});
