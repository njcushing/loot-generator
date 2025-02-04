import { LootGeneratorState } from "@/pages/LootGenerator";
import { Loot } from "../types";

export const sortLoot = (
    loot: Loot,
    sortOptions: LootGeneratorState["sortOptions"],
): Map<string, Loot[string]> => {
    const { selected, options } = sortOptions;
    const criteria = options.find((option) => option.name === selected)?.criteria;

    let mutableLoot = new Map([...Object.entries(loot)]);

    if (!criteria) return mutableLoot;

    switch (selected) {
        case "name": {
            const order = criteria.find((criterion) => criterion.name === "order")?.selected;
            if (!order) break;
            // Sort by 'name' as a priority, and fall back on key in its absence
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [keyA, itemA] = a;
                    const [keyB, itemB] = b;

                    const nameA = itemA.props.name || keyA;
                    const nameB = itemB.props.name || keyB;

                    return nameA.localeCompare(nameB) * (order === "descending" ? -1 : 1);
                }),
            );
            break;
        }
        case "quantity": {
            const order = criteria.find((criterion) => criterion.name === "order")?.selected;
            if (!order) break;
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [, itemA] = a;
                    const [, itemB] = b;

                    return (itemA.quantity - itemB.quantity) * (order === "descending" ? -1 : 1);
                }),
            );
            break;
        }
        case "value": {
            const order = criteria.find((criterion) => criterion.name === "order")?.selected;
            const summation = criteria.find(
                (criterion) => criterion.name === "summation",
            )?.selected;
            if (!order) break;
            if (!summation) break;
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [, itemA] = a;
                    const [, itemB] = b;

                    let valueA = itemA.props.value || 1;
                    let valueB = itemB.props.value || 1;

                    if (summation === "total") {
                        valueA *= itemA.quantity;
                        valueB *= itemB.quantity;
                    }

                    return (valueA - valueB) * (order === "descending" ? -1 : 1);
                }),
            );
            break;
        }
        default:
            break;
    }

    return mutableLoot;
};
