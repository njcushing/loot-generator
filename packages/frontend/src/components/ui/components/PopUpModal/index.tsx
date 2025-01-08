import { useEffect, useRef, useMemo } from "react";
import styles from "./index.module.css";

export type TPopUpModal = {
    text: string;
    timer?: {
        duration?: number;
        callback?: () => unknown;
    };
};

const defaultTimer: Required<TPopUpModal["timer"]> = {
    duration: -1,
    callback: () => {},
};

export function PopUpModal({ text, timer }: TPopUpModal) {
    const concatenatedTimer = useMemo(() => {
        return { ...defaultTimer, ...timer };
    }, [timer]);

    const timerRef = useRef<NodeJS.Timeout>();
    useEffect(() => {
        const { duration, callback } = concatenatedTimer!;

        if (Number.isNaN(timerRef.current)) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => callback && callback(), duration);

        return () => {
            if (Number.isNaN(timerRef.current)) clearTimeout(timerRef.current);
        };
    }, [concatenatedTimer]);

    return (
        <div className={styles["pop-up-modal"]}>
            <p className={styles["text"]}>{text}</p>
        </div>
    );
}
