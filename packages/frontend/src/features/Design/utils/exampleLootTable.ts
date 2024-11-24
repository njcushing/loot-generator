import { LootTable } from "@/utils/types";
import { createLootItem, createLootTable } from "@/utils/generateLoot";

export const exampleLootTable: LootTable = createLootTable({
    props: {
        loot: [
            createLootItem({ props: { name: "Apple" }, criteria: { weight: 10 } }),
            createLootItem({ props: { name: "Banana" }, criteria: { weight: 10 } }),
            createLootItem({ props: { name: "Orange" }, criteria: { weight: 10 } }),
            createLootItem({ props: { name: "Peach" }, criteria: { weight: 10 } }),
            createLootItem({ props: { name: "Cherry" }, criteria: { weight: 10 } }),
            createLootTable({
                props: {
                    loot: [
                        createLootItem({ props: { name: "Pineapple" }, criteria: { weight: 10 } }),
                        createLootItem({ props: { name: "Kiwi" }, criteria: { weight: 10 } }),
                        createLootItem({ props: { name: "Watermelon" }, criteria: { weight: 10 } }),
                        createLootTable({
                            props: {
                                loot: [
                                    createLootItem({
                                        props: { name: "Lemon" },
                                        criteria: { weight: 10 },
                                    }),
                                    createLootItem({
                                        props: { name: "Lime" },
                                        criteria: { weight: 10 },
                                    }),
                                    createLootItem({
                                        props: { name: "Passionfruit" },
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
