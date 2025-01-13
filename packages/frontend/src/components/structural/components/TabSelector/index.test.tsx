import { screen, render, fireEvent } from "@testing-library/react";
import { act } from "react";
import "@testing-library/jest-dom";
import { TabSelector, TTabSelector } from ".";

const exampleProps: TTabSelector = {
    tabs: {
        tab_1: { name: "Tab 1", content: <div>Tab 1 Content</div>, position: "left" },
        tab_2: { name: "Tab 2", content: <div>Tab 2 Content</div>, position: "left" },
        tab_3: { name: "Tab 3", content: <div>Tab 3 Content</div>, position: "right" },
        tab_4: { name: "Tab 4", content: <div>Tab 4 Content</div>, position: "right" },
    },
    selectedTabName: "tab_3",
};

describe("The 'TabSelector' component...", () => {
    describe("Should render buttons...", () => {
        test("One for each tab, with the display text being the same as the 'name' field for each tab", async () => {
            render(<TabSelector {...exampleProps} />);

            expect(screen.getByRole("button", { name: "Tab 1" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 4" })).toBeInTheDocument();
        });
        test("Or the tab's key in the 'tabs' object if the 'name' field is empty or undefined", async () => {
            render(
                <TabSelector
                    {...exampleProps}
                    tabs={{
                        ...exampleProps.tabs,
                        tab_1: { ...exampleProps.tabs.tab_1, name: "" },
                        tab_2: { ...exampleProps.tabs.tab_2, name: undefined },
                    }}
                />,
            );

            expect(screen.getByRole("button", { name: "tab_1" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "tab_2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 4" })).toBeInTheDocument();
        });
        test("Which, on click, should set that tab as the selected tab, and display its content", async () => {
            render(<TabSelector {...exampleProps} />);

            const tab1Button = screen.getByRole("button", { name: "Tab 1" });
            expect(tab1Button).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Tab 4" })).toBeInTheDocument();

            expect(screen.queryByText("Tab 3 Content")).toBeInTheDocument();

            await act(async () => {
                fireEvent.click(tab1Button);
                fireEvent.mouseLeave(tab1Button);
            });

            expect(screen.queryByText("Tab 1 Content")).toBeInTheDocument();
            expect(screen.queryByText("Tab 3 Content")).toBeNull();
        });
    });
    describe("Should display the selected tab's content...", () => {
        test("And not the content for any of the other tabs", async () => {
            render(<TabSelector {...exampleProps} />);

            expect(screen.queryByText("Tab 1 Content")).toBeNull();
            expect(screen.queryByText("Tab 2 Content")).toBeNull();
            expect(screen.queryByText("Tab 3 Content")).toBeInTheDocument();
            expect(screen.queryByText("Tab 4 Content")).toBeNull();
        });
        test("And the selected tab should default to the first one specified in the 'tabs' prop if the 'selectedTabName' prop is undefined or does not match one of the keys in the 'tabs' object", async () => {
            render(<TabSelector {...exampleProps} selectedTabName={undefined} />);

            expect(screen.queryByText("Tab 1 Content")).toBeInTheDocument();
            expect(screen.queryByText("Tab 2 Content")).toBeNull();
            expect(screen.queryByText("Tab 3 Content")).toBeNull();
            expect(screen.queryByText("Tab 4 Content")).toBeNull();
        });
        test("Unless no tabs are provided, in which case no tab content will be displayed", async () => {
            render(<TabSelector {...exampleProps} tabs={{}} />);

            expect(screen.queryByText("Tab 1 Content")).toBeNull();
            expect(screen.queryByText("Tab 2 Content")).toBeNull();
            expect(screen.queryByText("Tab 3 Content")).toBeNull();
            expect(screen.queryByText("Tab 4 Content")).toBeNull();
        });
        test("Or if the selected tab is removed from the 'tabs' prop, in which case the selected tab will default to the first one specified in the 'tabs' prop", async () => {
            const initialTabs: TTabSelector["tabs"] = {
                tab_1: { name: "Tab 1", content: <div>Tab 1 Content</div>, position: "left" },
                tab_2: { name: "Tab 2", content: <div>Tab 2 Content</div>, position: "left" },
                tab_3: { name: "Tab 3", content: <div>Tab 3 Content</div>, position: "right" },
                tab_4: { name: "Tab 4", content: <div>Tab 4 Content</div>, position: "right" },
            };

            const { rerender } = render(<TabSelector {...exampleProps} tabs={initialTabs} />);

            expect(screen.queryByText("Tab 1 Content")).toBeNull();
            expect(screen.queryByText("Tab 2 Content")).toBeNull();
            expect(screen.queryByText("Tab 3 Content")).toBeInTheDocument();
            expect(screen.queryByText("Tab 4 Content")).toBeNull();

            const updatedTabs = { ...initialTabs };
            delete updatedTabs.tab_3;

            await act(async () => rerender(<TabSelector {...exampleProps} tabs={updatedTabs} />));

            expect(screen.queryByText("Tab 1 Content")).toBeInTheDocument();
            expect(screen.queryByText("Tab 3 Content")).toBeNull();
        });
    });
});
