import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { vi } from "vitest";
import { act } from "react";
import { ToggleBar, TToggleBar } from ".";

const mockProps: TToggleBar = {
    defaultState: false,
    name: "ToggleBar",
    options: [
        { symbol: "Option 1", onClick: () => {}, colours: { hover: "yellow", focus: "green" } },
        { symbol: "Option 2", onClick: () => {} },
        { symbol: "Option 3", onClick: () => {} },
    ],
    onClick: () => {},
    disabled: false,
    children: <div>Child Elements</div>,
    style: { colours: { normal: "pink", hover: "red", focus: "orange" } },
};

type renderFuncArgs = { propsOverride?: TToggleBar };
const renderFunc = (args: renderFuncArgs = {}) => {
    const { propsOverride } = args;

    const component = (
        <ToggleBar
            defaultState={propsOverride?.defaultState || mockProps.defaultState}
            name={propsOverride?.name || mockProps.name}
            options={propsOverride?.options || mockProps.options}
            onClick={propsOverride?.onClick || mockProps.onClick}
            disabled={propsOverride?.disabled || mockProps.disabled}
            style={propsOverride?.style || mockProps.style}
        >
            {propsOverride?.children || mockProps.children}
        </ToggleBar>
    );

    const { rerender, unmount } = render(component);

    return { rerender, unmount, component };
};

describe("The ToggleBar component...", () => {
    describe("Should render a main button component...", () => {
        describe("That renders a child <p> element...", () => {
            test("With text content 'Add' if the value of the 'defaultState' prop is 'false' and the 'style.indicator' prop is 'signs'", () => {
                renderFunc();

                const symbolElement = screen.getByText("Add");
                expect(symbolElement).toBeInTheDocument();
            });
            test("With text content 'Remove' if the value of the 'defaultState' prop is 'true' and the 'style.indicator' prop is 'signs'", () => {
                renderFunc({ propsOverride: { ...mockProps, defaultState: true } });

                const symbolElement = screen.getByText("Remove");
                expect(symbolElement).toBeInTheDocument();
            });
            test("With text content 'Keyboard_Arrow_Right' if the value of the 'defaultState' prop is 'false' and the 'style.indicator' prop is 'arrows'", () => {
                renderFunc({
                    propsOverride: {
                        ...mockProps,
                        style: { ...mockProps.style, size: "s", indicator: "arrows" },
                    },
                });

                const symbolElement = screen.getByText("Keyboard_Arrow_Right");
                expect(symbolElement).toBeInTheDocument();
            });
            test("With text content 'Keyboard_Arrow_Down' if the value of the 'defaultState' prop is 'true' and the 'style.indicator' prop is 'arrows'", () => {
                renderFunc({
                    propsOverride: {
                        ...mockProps,
                        defaultState: true,
                        style: { ...mockProps.style, indicator: "arrows" },
                    },
                });

                const symbolElement = screen.getByText("Keyboard_Arrow_Down");
                expect(symbolElement).toBeInTheDocument();
            });
        });
        test("That renders an additional child <p> element with text content equal to the value of the 'name' prop", () => {
            renderFunc();

            const nameElement = screen.getByText("ToggleBar");
            expect(nameElement).toBeInTheDocument();
        });
        test("That, on click, should toggle the 'open' state (i.e. - flips the boolean value provided in the 'defaultState' prop)", async () => {
            renderFunc();

            const symbolElement = screen.getByText("Add");
            expect(symbolElement).toBeInTheDocument();

            const toggleBarButton = symbolElement.parentElement;
            expect(toggleBarButton).toBeInTheDocument();

            await act(async () => userEvent.click(toggleBarButton!));
            fireEvent.mouseLeave(toggleBarButton!);

            expect(screen.queryByText("Add")).not.toBeInTheDocument();
            expect(screen.getByText("Remove")).toBeInTheDocument();
        });
        test("And, on click, should invoke the callback function provided in the 'onClick' prop", async () => {
            const onClickCallback = vi.fn();

            renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

            const toggleBarButton = screen.getByText("Add").parentElement;

            await act(async () => userEvent.click(toggleBarButton!));
            fireEvent.mouseLeave(toggleBarButton!);

            expect(onClickCallback).toHaveBeenCalled();
        });
    });

    describe("Should render a button element for each entry in the 'options' prop", () => {
        test("With text content equal to the value of the 'symbol' field for that option", () => {
            renderFunc();

            const option1Button = screen.getByText("Option 1");
            expect(option1Button).toBeInTheDocument();
            const option2Button = screen.getByText("Option 2");
            expect(option2Button).toBeInTheDocument();
            const option3Button = screen.getByText("Option 3");
            expect(option3Button).toBeInTheDocument();
        });
        test("That, on click, should invoke callback function passed to the 'onClick' field for that option", async () => {
            const onClickCallback = vi.fn();
            const option4 = { symbol: "Option 4", onClick: onClickCallback };
            const options = [...mockProps.options!];
            options.push(option4);

            renderFunc({ propsOverride: { ...mockProps, options } });

            const option4Button = screen.getByText("Option 4");
            expect(option4Button).toBeInTheDocument();

            await act(async () => userEvent.click(option4Button!));
            fireEvent.mouseLeave(option4Button);

            expect(onClickCallback).toHaveBeenCalled();
        });
    });

    describe("Should render the child components...", () => {
        test("If the 'defaultState' prop (or internal 'isOpen' state after initialisation) is 'true'", () => {
            renderFunc({ propsOverride: { ...mockProps, defaultState: true } });

            const childElements = screen.getByText("Child Elements");
            expect(childElements).toBeInTheDocument();
        });
        test("But not if the 'defaultState' prop (or internal 'isOpen' state after initialisation) is 'false'", () => {
            renderFunc();

            const childElements = screen.queryByText("Child Elements");
            expect(childElements).toBeNull();
        });
    });
});
