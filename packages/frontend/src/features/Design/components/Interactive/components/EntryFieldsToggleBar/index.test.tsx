import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { EntryFieldsToggleBar, TEntryFieldsToggleBar } from ".";

// Mock dependencies
const mockProps: TEntryFieldsToggleBar = {
    name: "EntryFieldsToggleBar",
    onClick: () => {},
    fields: (
        <>
            <div>field_1</div>
            <div>field_2</div>
            <div>field_3</div>
        </>
    ),
    subCategories: (
        <>
            <div>subcategory_1</div>
            <div>subcategory_2</div>
            <div>subcategory_3</div>
        </>
    ),
};

type renderFuncArgs = {
    propsOverride?: TEntryFieldsToggleBar;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { propsOverride } = args;

    const component = (
        <EntryFieldsToggleBar
            name={propsOverride?.name || mockProps.name}
            onClick={propsOverride?.onClick || mockProps.onClick}
            fields={propsOverride?.fields || mockProps.fields}
            subCategories={propsOverride?.subCategories || mockProps.subCategories}
        />
    );

    const { rerender, unmount } = render(component);

    return { rerender, unmount, component };
};

vi.mock("@/components/buttons/components/ToggleBar", () => ({
    ToggleBar: vi.fn(({ onClick, children, style }) => {
        return (
            <button
                aria-label="ToggleBar Component"
                type="button"
                onClick={() => onClick && onClick()}
            >
                {style.nameFontStyle}
                {children}
            </button>
        );
    }),
}));

describe("The EntryFieldsToggleBar component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render the ToggleBar component", () => {
        renderFunc();

        const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
        expect(ToggleBarComponent).toBeInTheDocument();
    });
    test("Should pass the value of the 'onClick' prop to the ToggleBar component's 'onClick' prop", async () => {
        const onClickCallback = vi.fn();

        renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

        const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
        expect(ToggleBarComponent).toBeInTheDocument();

        await userEvent.click(ToggleBarComponent);

        expect(onClickCallback).toHaveBeenCalled();
    });
    test("Should render all the elements passed to the 'fields' prop as child components of the ToggleBar component", async () => {
        renderFunc();

        const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
        expect(ToggleBarComponent).toBeInTheDocument();

        const field1Component = screen.getByText("field_1");
        expect(field1Component).toBeInTheDocument();
        expect(ToggleBarComponent.contains(field1Component)).toBeTruthy();
        const field2Component = screen.getByText("field_2");
        expect(field2Component).toBeInTheDocument();
        expect(ToggleBarComponent.contains(field2Component)).toBeTruthy();
        const field3Component = screen.getByText("field_3");
        expect(field3Component).toBeInTheDocument();
        expect(ToggleBarComponent.contains(field3Component)).toBeTruthy();
    });
    test("Should render all the elements passed to the 'subCategories' prop as child components of the ToggleBar component", async () => {
        renderFunc();

        const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
        expect(ToggleBarComponent).toBeInTheDocument();

        const subCategory1Component = screen.getByText("subcategory_1");
        expect(subCategory1Component).toBeInTheDocument();
        expect(ToggleBarComponent.contains(subCategory1Component)).toBeTruthy();
        const subCategory2Component = screen.getByText("subcategory_2");
        expect(subCategory2Component).toBeInTheDocument();
        expect(ToggleBarComponent.contains(subCategory2Component)).toBeTruthy();
        const subCategory3Component = screen.getByText("subcategory_3");
        expect(subCategory3Component).toBeInTheDocument();
        expect(ToggleBarComponent.contains(subCategory3Component)).toBeTruthy();
    });
});
