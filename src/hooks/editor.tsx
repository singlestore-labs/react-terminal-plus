import * as React from "react";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTerminal } from "../contexts/TerminalContext";

import Utils from "../common/Utils";

export const useEditorInput = (
  {
    consoleFocused,
    enableInput,
    commands,
    defaultHandler,
    errorMessage,
    prompt = "$",
  }: {
    consoleFocused: boolean;
    enableInput: boolean;
    commands: Record<string, string | ((...args: any[]) => any)>;
    defaultHandler?: (...args: any[]) => any;
    errorMessage?: (...args: any[]) => any;
    prompt?: string;
  }
) => {
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);
  const {
    getPreviousCommand, getNextCommand, store, send
  } = useTerminal();

  const processCommand = React.useCallback(async () => {
    const [command, ...rest] = store.editorInput.trim().split(" ");
    let output = "";

    if (command === "clear") {
      send({ type: "CLEAR" });
      return;
    }

    const waiting = (
      <>
        {store.bufferedContent}
        <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
        <span className={`${style.lineText} ${style.preWhiteSpace}`}>
          {store.editorInput}
        </span>
        <br />
      </>
    );
    send({ type: "SUBMIT", loaderNode: waiting, command });

    if (store.editorInput) {
      const commandArguments = rest.join(" ");

      if (command && commands[command]) {
        const executor = commands[command];

        if (typeof executor === "function") {
          output = await executor(commandArguments);
        } else {
          output = executor;
        }
      } else if (typeof defaultHandler === "function") {
        output = await defaultHandler(command, commandArguments);
      } else if (typeof errorMessage === "function") {
        output = await errorMessage(command, commandArguments);
      } else {
        output = errorMessage;
      }
    }

    // if is a promise
    // clearTimeout
    // if is arbitrary code
    // return;

    const nextBufferedContent = (
      <>
        {store.bufferedContent}
        <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
        <span className={`${style.lineText} ${style.preWhiteSpace}`}>
          {store.editorInput}
        </span>
        {output ? (
          <span>
            <br />
            {output}
          </span>
        ) : null}
        <br />
      </>
    );

    send({ type: "SUBMIT_SUCCESS", successNode: nextBufferedContent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send, store.bufferedContent, store.editorInput]);

  const handleKeyDownEvent = React.useCallback((event: KeyboardEvent) => {
    if (!consoleFocused) {
      return;
    }
    // checks the value of enableInput and returns if its false
    if (!enableInput) {
      return;
    }
    event.preventDefault();

    const eventKey = event.key;

    if (eventKey === "Enter") {
      processCommand();
      return;
    }

    let nextInput = null;

    if (eventKey === "Backspace") {
      if (store.editorInput && store.editorInput.length !== 0) {
        send({ type: "DELETE", text: nextInput });
      }
    } else if (eventKey === "ArrowUp") {
      nextInput = getPreviousCommand();
      if (nextInput) { send({ type: "ARROW_UP", previousCommand: nextInput }); }
    } else if (eventKey === "ArrowDown") {
      nextInput = getNextCommand();
      if (nextInput) {
        send({ type: "ARROW_DOWN", nextCommand: nextInput });
      } else {
        send({ type: "RESET_CARET_POSITION" });
      }
    } else if (eventKey === "ArrowLeft") {
      if (store.caretPosition > 0) {
        send({ type: "ARROW_LEFT" });
      }
      nextInput = store.editorInput;
    } else if (eventKey === "ArrowRight") {
      if (store.caretPosition < store.editorInput.length) {
        send({ type: "ARROW_RIGHT" });
      }
      nextInput = store.editorInput;
    } else if (
      (event.metaKey || event.ctrlKey)
      && eventKey.toLowerCase() === "v"
    ) {
      navigator.clipboard.readText().then((pastedText) => {
        send({ type: "PASTE", text: pastedText });
      });
    } else if (
      (event.metaKey || event.ctrlKey)
      && eventKey.toLowerCase() === "c"
    ) {
      const selectedText = window.getSelection().toString();
      navigator.clipboard.writeText(selectedText).then(() => {
        send({ type: "COPY" });
      });
    } else {
      if (eventKey && eventKey.length === 1) {
        send({ type: "TYPE", text: eventKey })
      }
    }
  }, [consoleFocused, enableInput, getNextCommand, getPreviousCommand, processCommand,
    send, store.caretPosition, store.editorInput]);

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("keydown", handleKeyDownEvent);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleKeyDownEvent);
    };
  }, [handleKeyDownEvent]);
};

export const useCurrentLine = (
  caret: boolean,
  consoleFocused: boolean,
  prompt: string,
  commands: any,
  errorMessage: any,
  enableInput: boolean,
  defaultHandler: any,
) => {
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);
  const { store } = useTerminal();

  console.log(store)


  const currentLine = store.currentLineStatus !== "processing" ? (
    <>
      <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
      <div className={style.lineText}>
        <span className={style.preWhiteSpace}>{store.textBeforeCaret}</span>
        {consoleFocused && caret ? ( // if caret isn't true, caret won't be displayed
          <span className={style.caret}>
            <span
              className={style.caretAfter}
              style={{ background: themeStyles.themeColor }}
            />
          </span>
        ) : null}
        <span className={style.preWhiteSpace}>{store.textAfterCaret}</span>
      </div>
    </>
  ) : (
    <>
      <div className={style.lineText}>
        {consoleFocused && caret ? ( // if caret isn't true, caret won't be displayed
          <span className={style.caret}>
            <span
              className={style.caretAfter}
              style={{ background: themeStyles.themeColor }}
            />
          </span>
        ) : null}
      </div>
    </>
  );

  useEditorInput(
    {
      commands,
      errorMessage,
      defaultHandler,
      enableInput,
      prompt,
      consoleFocused
    }
  );

  return currentLine;
};

export const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(() => {
    if (!wrapperRef.current) { return; }
    // eslint-disable-next-line no-param-reassign
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};
