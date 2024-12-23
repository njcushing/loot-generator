import styles from "./index.module.css";

export type TLootEntry = {
    id: string | null;
};

export function LootEntry({ id }: TLootEntry) {
    return <li></li>;
}
