import styles from "./index.module.css";

export type TPopUpModal = {
    text: string;
};

export function PopUpModal({ text }: TPopUpModal) {
    return (
        <div className={styles["pop-up-modal"]}>
            <p className={styles["text"]}>{text}</p>
        </div>
    );
}
