import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { Messages, IMessagesContext, MessagesContext } from ".";

const renderFunc = () => {
    let MessagesContextValue!: IMessagesContext;

    const component = (
        <Messages>
            <MessagesContext.Consumer>
                {(value) => {
                    MessagesContextValue = value;
                    return null;
                }}
            </MessagesContext.Consumer>
        </Messages>
    );

    const { rerender } = render(component);

    return { rerender, MessagesContextValue, component };
};

vi.mock("@/components/ui/components/PopUpModal", () => ({
    PopUpModal: vi.fn(({ text, onClose }) => {
        /*
         * This component will invoke the callback function provided to the 'onClose' prop when the
         * amount of time passed to the 'timer.duration' prop has elapsed. For the sake of
         * simplicity mocking the component, I am calling it whenever the component's button is
         * clicked.
         */
        return (
            <div aria-label="PopUpModal Component">
                <p>{text}</p>
                <button type="button" onClick={() => onClose && onClose()}>
                    {`${text}-Close`}
                </button>
            </div>
        );
    }),
}));

describe("The Messages component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render a <ul> element with the name 'loot-generator-messages'", () => {
        renderFunc();

        const unorderedList = screen.getByRole("list", { name: "loot-generator-messages" });
        expect(unorderedList).toBeInTheDocument();
    });

    describe("Should pass context to its descendant components...", () => {
        test("Including the 'displayMessage' function", async () => {
            const { MessagesContextValue } = renderFunc();

            expect(MessagesContextValue).toBeDefined();

            const { displayMessage } = MessagesContextValue;
            expect(displayMessage).toBeDefined();
        });
        test("Which, when called, should add a <li> element within the <ul> element", async () => {
            const { MessagesContextValue } = renderFunc();
            const { displayMessage } = MessagesContextValue;

            expect(screen.queryAllByRole("listitem")).toHaveLength(0);

            await act(async () => displayMessage("testing"));

            expect(screen.getAllByRole("listitem")).toHaveLength(1);

            await act(async () => displayMessage("testing again"));

            expect(screen.getAllByRole("listitem")).toHaveLength(2);
        });
    });

    test("Should render a PopUpModal component within each <li> element", async () => {
        const { MessagesContextValue } = renderFunc();
        const { displayMessage } = MessagesContextValue;

        expect(screen.queryByLabelText("PopUpModal Component")).toBeNull();

        await act(async () => displayMessage("testing"));

        expect(screen.getByLabelText("PopUpModal Component")).toBeInTheDocument();
    });
    test("Should, when an <li> element's PopUpModal component's 'onClose' prop is called, remove that <li> element after its closing animation has ended", async () => {
        const { MessagesContextValue } = renderFunc();
        const { displayMessage } = MessagesContextValue;

        await act(async () => displayMessage("testing"));

        const PopUpModalComponentButton = screen.getByRole("button", { name: "testing-Close" });

        await act(async () => userEvent.click(PopUpModalComponentButton));

        const listItem = screen.getByRole("listitem");

        fireEvent.animationEnd(listItem);

        expect(screen.queryByRole("listitem")).toBeNull();
    });
});
