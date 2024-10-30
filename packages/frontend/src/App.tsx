import { useState, useEffect } from "react";
import { Pages } from "./pages";
import config from "./appconfig.json";

export function App() {
    // Calculate 'vw' and 'vh' units
    useEffect(() => {
        const setUnits = () => {
            const vw = window.innerWidth * 0.01;
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vw", `${vw}px`);
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        setUnits();
        window.addEventListener("resize", setUnits);

        return () => {
            window.removeEventListener("resize", setUnits);
        };
    }, []);

    const [rootElement] = useState<HTMLElement>(document.getElementById("root") as HTMLElement);

    // Use applicable app config values
    useEffect(() => {
        rootElement.style.maxWidth = config.displayMaxWidth;
    }, [rootElement]);

    return <Pages.LootGenerator />;
}
