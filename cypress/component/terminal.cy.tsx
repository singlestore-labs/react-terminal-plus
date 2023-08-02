import React from "react";
import { ReactTerminal, TerminalContextProvider } from "../../src/index"

describe("ReactTerminal", () => {
  it("renders ReactTerminal component", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal />
      </TerminalContextProvider>
    );
  });

  it("selects terminal component when clicked inside it", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal />
      </TerminalContextProvider>
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
      </div>
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
      </TerminalContextProvider>
    );

    writeInTerminal("invalid_command");
    cy.findByText("invalid_command").should("not.exist");
  });

  it("execute an invalid command on terminal component returns default text", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal />
      </TerminalContextProvider>
    );

    writeInTerminal("invalid_command");
    writeInTerminal("Enter");

    cy.findByText("not found!");
  });

  it("execute a valid command on terminal component", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal commands={{ whoami: "jackharper" }} />
      </TerminalContextProvider>
    );

    writeInTerminal("whoami");
    writeInTerminal("Enter");
    cy.findByText("jackharper");
  });

  it("command can call a function", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal commands={{
          whoami: () => {
            return "jackharper";
          }
        }} />
      </TerminalContextProvider>
    );

    writeInTerminal("whoami");
    writeInTerminal("Enter");
    cy.findByText("jackharper");
  });

  it("backspace deletes a character", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal commands={{ whoami: "jackharper" }} />
      </TerminalContextProvider>
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
      </TerminalContextProvider>
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
      </TerminalContextProvider>
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
      </TerminalContextProvider>
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
        <ReactTerminal commands={{ whoami: "jackharper", whoamiwhoami: "copy/paste working" }} />
      </TerminalContextProvider>
    );

    writeInTerminal("whoami", true);

    cy.get('[class*="preWhiteSpace"]').eq(0).then(($element) => {
      const range = document.createRange();
      range.selectNodeContents($element[0]);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      cy.wrap($element).trigger("keydown", { metaKey: true, key: "c" });
    });

    cy.get('[class*="preWhiteSpace"]').eq(0).realClick().trigger("keydown", { metaKey: true, key: "v" });
    cy.findByText("whoamiwhoami");

    writeInTerminal("Enter");
    cy.findByText("copy/paste working");
  });

  it("empty command does nothing", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal commands={{ whoami: "jackharper" }} />
      </TerminalContextProvider>
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
      </TerminalContextProvider>
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
      </TerminalContextProvider>
    );

    writeInTerminal("Tab");
    cy.findByText(">>>", { exact: true });
  });

  it("custom errorMessage is string", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal errorMessage="Command not found" />
      </TerminalContextProvider>
    );

    writeInTerminal("invalid_command");
    writeInTerminal("Enter");
    cy.findByText("Command not found", { exact: true });
  });

  it("custom errorMessage is function", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal errorMessage={() => {
          return "Function but command not found";
        }} />
      </TerminalContextProvider>
    );

    writeInTerminal("invalid_command");
    writeInTerminal("Enter");
    cy.findByText("Function but command not found", { exact: true });
  });

  it("defaultHandler is used if provided when no commands match", () => {
    cy.mount(
      <TerminalContextProvider>
        <ReactTerminal commands={{ whoami: "jackharper" }} defaultHandler={() => {
          return "default command handler triggered";
        }} />
      </TerminalContextProvider>
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
        <ReactTerminal commands={{
          whoami: () => new Promise((resolve) => {
            setTimeout(() => resolve("jackharper"), 500);
          })
        }} defaultHandler={() => {
          return "default command handler triggered";
        }} />
      </TerminalContextProvider>
    );

    writeInTerminal("whoami");
    writeInTerminal("Enter");
    cy.findByText("jackharper", { exact: true });
    writeInTerminal("whoami");
    writeInTerminal("Enter");
    writeInTerminal("c", true);
    // only 1 jackharper should be present
    cy.findAllByText("jackharper", { exact: true, timeout: 1000 }).should("have.length", 1);
  });

});

function writeText(container: Cypress.Chainable<JQuery<HTMLElement>>, value: string, metaKey: boolean, shiftKey: boolean) {
  if (["Enter", "Backspace", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(value)) {
    container.trigger("keydown", {
      metaKey: metaKey,
      shiftKey: shiftKey,
      key: value
    })
    return;
  }

  value.split("").forEach(char => {
    container.trigger("keydown", {
      metaKey: metaKey,
      shiftKey: shiftKey,
      key: char
    })
  })
}

function writeInTerminal(command: string, metaKey = false, shiftKey = false) {
  cy.findByTestId("terminal").click().then((elem) => {
    writeText(cy.wrap(elem), command, metaKey, shiftKey);
  });
}
