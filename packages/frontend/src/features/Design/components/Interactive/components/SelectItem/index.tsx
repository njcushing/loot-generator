import { useMemo } from "react";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";

export type TSelectItem = {
    onClick?: () => unknown;
};

export function SelectItem({ onClick }: TSelectItem) {
    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        options.push({
            symbol: "Edit",
            onClick: () => {
                if (onClick) onClick();
            },
        });
        return options;
    }, [onClick]);

    return (
        <ToggleBar
            name="Please select an item"
            defaultState={false}
            options={toggleBarOptions}
            onClick={() => {
                if (onClick) onClick();
            }}
            style={{
                size: "s",
                colours: {
                    normal: "rgb(181, 186, 255)",
                    hover: "rgb(164, 169, 252)",
                    focus: "rgb(155, 161, 252)",
                },
                indicator: "none",
                nameFontStyle: "italic",
            }}
        />
    );
}
