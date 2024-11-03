import { Items } from "../../features/Generate/components/Loot";

export type SortCriteria = "name" | "quantity";
export type SortOrder = "ascending" | "descending";

export type SortOptions = Map<SortCriteria, SortOrder>;

export const sortLoot = (loot: Items, sorts: SortOptions): Items => {
    let mutableLoot = new Map([...loot.entries()]);

    [...sorts.keys()].forEach((criteria) => {
        const order = sorts.get(criteria);
        switch (criteria) {
            case "name":
                // Sort by 'name' as a priority, and fall back on key in its absence
                mutableLoot = new Map(
                    [...mutableLoot.entries()].sort((a, b) => {
                        const [keyA, valueA] = a;
                        const [keyB, valueB] = b;

                        const nameA = valueA?.name;
                        const nameB = valueB?.name;

                        let result;

                        if (nameA && nameB) result = nameA.localeCompare(nameB);
                        else if (nameA) result = nameA.localeCompare(keyB);
                        else if (nameB) result = keyA.localeCompare(nameB);
                        else result = keyA.localeCompare(keyB);

                        return result * (order === "descending" ? -1 : 1);
                    }),
                );
                break;
            case "quantity":
                mutableLoot = new Map(
                    [...mutableLoot.entries()].sort((a, b) => {
                        const quantityA = a[1].quantity;
                        const quantityB = b[1].quantity;

                        return (quantityA - quantityB) * (order === "descending" ? -1 : 1);
                    }),
                );
                break;
            default:
        }
    });

    return mutableLoot;
};
