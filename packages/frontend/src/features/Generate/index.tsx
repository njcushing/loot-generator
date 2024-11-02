import styles from "./index.module.css";

const createButton = (text: string, className: string = "generation-quantity-button") => {
    return (
        <button
            // eslint-disable-next-line react/button-has-type
            type="button"
            className={styles[className]}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            {text}
        </button>
    );
};

export function Generate() {
    return (
        <div className={styles["generate"]}>
            <div></div>
            <div className={styles["generation-quantity-buttons"]}>
                {createButton("1")}
                {createButton("10")}
                {createButton("100")}
                {createButton("1000")}
                {createButton("Custom")}
            </div>
            <div className={styles["generate-and-reset-buttons"]}>
                {createButton("Generate", "generate-button")}
                {createButton("Reset", "reset-button")}
            </div>
        </div>
    );
}
