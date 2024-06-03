import React from "react";
import { ReactTerminal, TerminalContextProvider } from "../../src/index";
import dark from "../../src/themes/dark";

describe("ReactTerminal", () => {
	it("renders ReactTerminal component", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);
	});

	it("selects terminal component when clicked inside it", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("invalid_command");
		cy.findByText("invalid_command");
	});

	it("unselects terminal component when clicked outside it", () => {
		cy.mount(
			<div data-testid="outer-shell" style={{ padding: "100px" }}>
				<TerminalContextProvider>
					<ReactTerminal />
				</TerminalContextProvider>
			</div>,
		);

		writeInTerminal("invalid_command");
		cy.get('[class*="caret"]').should("exist");
		cy.findByTestId("outer-shell").click("top");
		cy.get('[class*="caret"]').should("not.exist");
	});

	it("doesnt register input when enableInput is false", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal enableInput={false} />
			</TerminalContextProvider>,
		);

		writeInTerminal("invalid_command");
		cy.findByText("invalid_command").should("not.exist");
	});

	it("execute an invalid command on terminal component returns default text", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("invalid_command");
		writeInTerminal("Enter");

		cy.findByText("not found!");
	});

	it("execute a valid command on terminal component", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal commands={{ whoami: "jackharper" }} />
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("Enter");
		cy.findByText("jackharper");
	});

	it("command can call a function", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal
					commands={{
						whoami: () => {
							return "jackharper";
						},
					}}
				/>
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("Enter");
		cy.findByText("jackharper");
	});

	it("backspace deletes a character", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal commands={{ whoami: "jackharper" }} />
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("Backspace");
		cy.findByText("whoam");
		writeInTerminal("i");
		writeInTerminal("Enter");
		cy.findByText("jackharper");
	});

	it("up arrow fetch previous command", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal commands={{ whoami: "jackharper" }} />
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("Enter");
		writeInTerminal("ArrowUp");
		cy.findAllByText("whoami").should("have.length", 2);
	});

	it("down arrow fetch next command", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal commands={{ whoami: "jackharper" }} />
			</TerminalContextProvider>,
		);

		writeInTerminal("ArrowUp");
		cy.get('[class*="preWhiteSpace"]').eq(0).should("have.text", "");
		cy.get('[class*="preWhiteSpace"]').eq(1).should("have.text", "");
		writeInTerminal("whoami");
		writeInTerminal("Enter");
		writeInTerminal("ArrowUp");
		cy.findAllByText("whoami").should("have.length", 2);
		writeInTerminal("ArrowUp");
		cy.findAllByText("whoami").should("have.length", 2);
		writeInTerminal("ArrowDown");
		cy.findAllByText("whoami").should("have.length", 1);
		writeInTerminal("ArrowDown");
		cy.findAllByText("whoami").should("have.length", 1);
	});

	it("arrow left/right moves the cursor", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal commands={{ whoami: "jackharper" }} />
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("ArrowLeft");
		cy.get('[class*="preWhiteSpace"]').eq(0).should("have.text", "whoam");
		cy.get('[class*="preWhiteSpace"]').eq(1).should("have.text", "i");
		writeInTerminal("ArrowRight");
		cy.get('[class*="preWhiteSpace"]').eq(0).should("have.text", "whoami");
		cy.get('[class*="preWhiteSpace"]').eq(1).should("have.text", "");
	});

	it("copy & paste the text from clipboard", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal
					commands={{
						whoami: "jackharper",
						whoamiwhoami: "copy/paste working",
					}}
				/>
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami", true);

		cy.get('[class*="preWhiteSpace"]')
			.eq(0)
			.then(($element) => {
				const range = document.createRange();
				range.selectNodeContents($element[0]);
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);

				cy.wrap($element).trigger("keydown", { metaKey: true, key: "c" });
			});

		cy.get('[class*="preWhiteSpace"]')
			.eq(0)
			.realClick()
			.trigger("keydown", { metaKey: true, key: "v" });
		cy.findByText("whoamiwhoami");

		writeInTerminal("Enter");
		cy.findByText("copy/paste working");
	});

	it("empty command does nothing", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal commands={{ whoami: "jackharper" }} />
			</TerminalContextProvider>,
		);

		writeInTerminal("");
		writeInTerminal("Enter");
		cy.get('[class*="preWhiteSpace"]').eq(0).should("have.text", "");
		cy.get('[class*="preWhiteSpace"]').eq(2).should("have.text", "");
	});

	it("clear command clears the console", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("invalid_command");
		writeInTerminal("Enter");
		cy.findByText("not found!");
		writeInTerminal("clear");
		writeInTerminal("Enter");
		cy.findByText(">>>", { exact: true });
	});

	it("doesnt do anything for unmappable key", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("Tab");
		cy.findByText(">>>", { exact: true });
	});

	it("custom errorMessage is string", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal errorMessage="Command not found" />
			</TerminalContextProvider>,
		);

		writeInTerminal("invalid_command");
		writeInTerminal("Enter");
		cy.findByText("Command not found", { exact: true });
	});

	it("custom errorMessage is function", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal
					errorMessage={() => {
						return "Function but command not found";
					}}
				/>
			</TerminalContextProvider>,
		);

		writeInTerminal("invalid_command");
		writeInTerminal("Enter");
		cy.findByText("Function but command not found", { exact: true });
	});

	it("defaultHandler is used if provided when no commands match", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal
					commands={{ whoami: "jackharper" }}
					defaultHandler={() => {
						return "default command handler triggered";
					}}
				/>
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("Enter");
		cy.findByText("jackharper", { exact: true });
		writeInTerminal("invalid_command");
		writeInTerminal("Enter");
		cy.findByText("default command handler triggered", { exact: true });
	});

	it("'ctrl + c' cancels the running command", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal
					commands={{
						whoami: () =>
							new Promise((resolve) => {
								setTimeout(() => resolve("jackharper"), 500);
							}),
					}}
					defaultHandler={() => {
						return "default command handler triggered";
					}}
				/>
			</TerminalContextProvider>,
		);

		writeInTerminal("whoami");
		writeInTerminal("Enter");
		cy.findByText("jackharper", { exact: true });
		writeInTerminal("whoami");
		writeInTerminal("Enter");
		writeInTerminal("c", true);
		// only 1 jackharper should be present
		cy.findAllByText("jackharper", { exact: true, timeout: 1000 }).should(
			"have.length",
			1,
		);
	});

	it("should save commands history in localstorage if enabled", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		const firstCommand = "first1111111111111111111111111111111111111111111111";
		const secondCommand = "second222222222222222222222222222222222";

		writeInTerminal(firstCommand);
		writeInTerminal("Enter");

		writeInTerminal(secondCommand);
		writeInTerminal("Enter");

		cy.mount(
			<TerminalContextProvider useLocalStorage={true}>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("ArrowUp");
		cy.findByText(secondCommand);
		writeInTerminal("ArrowUp");
		cy.findByText(firstCommand);

		cy.mount(
			<TerminalContextProvider useLocalStorage={false}>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("ArrowUp");
		cy.findByText("second").should("not.exist");
	});

	it("should have the character under the caret with the background color", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal theme="dark" />
			</TerminalContextProvider>,
		);

		// write text and move cursor to left
		writeInTerminal("db.connection.find({");
		writeInTerminal("ArrowLeft");

		// check the the char under the caret has the background color
		cy.get('[class*="charUnderCaret"]')
			.should("have.text", "{")
			.then(($element) => {
				cy.wrap($element).should("have.css", "color", dark.themeBGColor);
			});
	});

	it("should move the caret to the start if ctrl + a is pressed", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("db.connection.find({");
		writeInTerminal("a", true);

		// check the caret is at the start
		cy.get('[class*="charUnderCaret"]').should("have.text", "d");

		writeInTerminal("res = ");
		writeInTerminal("a", true);
		// check the caret is at the start again
		cy.get('[class*="charUnderCaret"]').should("have.text", "r");

		// move the caret to the right and then press ctrl + a
		writeInTerminal("ArrowRight");
		writeInTerminal("ArrowRight");
		writeInTerminal("a", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "r");
	});

	it("should move the caret to the end if ctrl + e is pressed", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("db.connection.find({");
		writeInTerminal("ArrowLeft");
		writeInTerminal("ArrowLeft");
		writeInTerminal("ArrowLeft");
		cy.get('[class*="charUnderCaret"]').should("have.text", "d");

		writeInTerminal("e", true);
		// check the caret is at the end
		cy.get('[class*="charUnderCaret"]').should("have.text", "");

		// check ctrl + e works with ctrl + a
		writeInTerminal("a", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "d");
		writeInTerminal("e", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "");
	});

	it("should move the caret to the start if Home is pressed", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("db.connection.find({");
		writeInTerminal("Home");

		// check the caret is at the start
		cy.get('[class*="charUnderCaret"]').should("have.text", "d");

		writeInTerminal("res = ");
		writeInTerminal("Home");
		// check the caret is at the start again
		cy.get('[class*="charUnderCaret"]').should("have.text", "r");

		// move the caret to the right and then press Home
		writeInTerminal("ArrowRight");
		writeInTerminal("ArrowRight");
		writeInTerminal("Home");
		cy.get('[class*="charUnderCaret"]').should("have.text", "r");
	});

	it("should move the caret to the end if End is pressed", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("db.connection.find({");
		writeInTerminal("ArrowLeft");
		writeInTerminal("ArrowLeft");
		writeInTerminal("ArrowLeft");
		cy.get('[class*="charUnderCaret"]').should("have.text", "d");

		writeInTerminal("End");
		// check the caret is at the end
		cy.get('[class*="charUnderCaret"]').should("have.text", "");

		// check End works with Home
		writeInTerminal("Home");
		cy.get('[class*="charUnderCaret"]').should("have.text", "d");
		writeInTerminal("End");
		cy.get('[class*="charUnderCaret"]').should("have.text", "");
	});

	it("should move the caret to the backward word if ctrl + ArrowLeft is pressed", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("is singlestore kai");
		writeInTerminal("ArrowLeft", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "k");

		writeInTerminal("ArrowLeft", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "s");

		writeInTerminal("ArrowLeft", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "i");

		writeInTerminal("this ");
		writeInTerminal("ArrowLeft", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "t");
	});

	it("should move the caret to the forward word if ctrl + ArrowRight is pressed", () => {
		cy.mount(
			<TerminalContextProvider>
				<ReactTerminal />
			</TerminalContextProvider>,
		);

		writeInTerminal("this is singlestore kai");

		// move the caret to the start
		writeInTerminal("a", true);
		writeInTerminal("ArrowRight", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "i");

		writeInTerminal("ArrowRight", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "s");

		writeInTerminal("ArrowRight", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "k");

		writeInTerminal("not");
		writeInTerminal("ArrowRight", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "");

		// try with ctrl + <
		writeInTerminal("ArrowLeft", true);
		writeInTerminal("ArrowRight", true);
		cy.get('[class*="charUnderCaret"]').should("have.text", "");
	});
});

function writeText(
	container: Cypress.Chainable<JQuery<HTMLElement>>,
	value: string,
	metaKey: boolean,
	shiftKey: boolean,
) {
	if (
		[
			"Enter",
			"Backspace",
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"Tab",
			"Home",
			"End",
		].includes(value)
	) {
		container.trigger("keydown", {
			metaKey: metaKey,
			shiftKey: shiftKey,
			key: value,
		});
		return;
	}

	value.split("").forEach((char) => {
		container.trigger("keydown", {
			metaKey: metaKey,
			shiftKey: shiftKey,
			key: char,
		});
	});
}

function writeInTerminal(command: string, metaKey = false, shiftKey = false) {
	cy.findByTestId("terminal")
		.click()
		.then((elem) => {
			writeText(cy.wrap(elem), command, metaKey, shiftKey);
		});
}
