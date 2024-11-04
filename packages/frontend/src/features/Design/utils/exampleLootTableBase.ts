import { LootTableBase } from "@/utils/types";
import { createLootItem, createLootTable, createLootTableBase } from "@/utils/generateLoot";

export const exampleLootTableBase: LootTableBase = createLootTableBase({
    loot: [
        createLootItem({ information: { name: "Apple" }, weight: 10 }),
        createLootItem({ information: { name: "Banana" }, weight: 10 }),
        createLootItem({ information: { name: "Orange" }, weight: 10 }),
        createLootItem({ information: { name: "Peach" }, weight: 10 }),
        createLootItem({ information: { name: "Cherry" }, weight: 10 }),
        createLootTable({
            weight: 100,
            loot: [
                createLootItem({ information: { name: "Pineapple" }, weight: 10 }),
                createLootItem({ information: { name: "Kiwi" }, weight: 10 }),
                createLootItem({ information: { name: "Watermelon" }, weight: 10 }),
            ],
        }),
    ],
});
