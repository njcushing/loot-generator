import { createContext, useState, useCallback, useRef, useMemo } from "react";
import { PopUpModal } from "@/components/ui/components/PopUpModal";
import { v4 as uuid } from "uuid";
import styles from "./index.module.css";

export type TMessages = {
    children?: JSX.Element | null | (JSX.Element | null)[];
};

interface MessagesContext {
    displayMessage: (text: string) => void;
}

const defaultMessagesContext: MessagesContext = {
    displayMessage: () => {},
};

export const MessagesContext = createContext<MessagesContext>(defaultMessagesContext);

export function Messages({ children }: TMessages) {
    const messages = useRef<{
        [key: string]: { state: "normal" | "removing"; element: JSX.Element };
    }>({});
    const [messagesMutated, setMessagesMutated] = useState<string>("");

    const displayMessage = useCallback((text: string) => {
        const id = uuid();
        const callback = () => {
            setMessagesMutated(uuid());
            if (!messages.current[id]) return;
            messages.current[id as keyof typeof messages.current].state = "removing";
        };
        const element = (
            <PopUpModal
                text={text}
                timer={{ duration: 5000, callback }}
                onClose={callback}
                key={id}
            />
        );
        messages.current[id] = { state: "normal", element };
    }, []);

    const messageElements = useMemo(() => {
        if (Object.keys(messages.current).length === 0) return null;

        return Object.entries(messages.current)
            .reverse()
            .map((entry, i) => {
                const [key, value] = entry;
                const { state, element } = value;
                return (
                    <li
                        className={`${styles["message-container"]} ${styles[state]}`}
                        onAnimationEnd={() => {
                            if (state !== "removing") return;
                            setMessagesMutated(uuid());
                            delete messages.current[key as keyof typeof messages.current];
                        }}
                        style={{
                            translate: `0px calc(${i} * (100% + 8px) * -1)`,
                        }}
                        key={key}
                    >
                        {element}
                    </li>
                );
            });
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [messagesMutated]);

    return (
        <MessagesContext.Provider value={useMemo(() => ({ displayMessage }), [displayMessage])}>
            <ul className={styles["messages"]}>{messageElements}</ul>
            {children}
        </MessagesContext.Provider>
    );
}
