import * as React from "react";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTerminal } from "../contexts/TerminalContext";
import { CancelablePromise } from "cancelable-promise";

export const useEditorInput = (
  {
    consoleFocused,
    enableInput,
    commands,
    defaultHandler,
    errorMessage,
    prompt
  }: {
    consoleFocused: boolean;
    enableInput: boolean;
    commands: Record<string, string | ((...args: any[]) => any)>;
    defaultHandler?: (...args: any[]) => any;
    errorMessage?: (...args: any[]) => any;
    prompt: string;
  }
) => {
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);
  const {
    getPreviousCommand, getNextCommand, store, send
  } = useTerminal();

  const runningPromiseRef = React.useRef<CancelablePromise>(null);

  const cancelCommand = React.useCallback(() => {
    if (runningPromiseRef.current) {
      runningPromiseRef.current.cancel();
    }

    let nextBufferedContent = (
      <>
        {store.bufferedContent}
        <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
        <span className={`${style.lineText} ${style.preWhiteSpace}`}>
          {store.editorInput}
        </span>
        <br />
      </>
    );

    if (store.currentLineStatus === "processing") {
      nextBufferedContent = (
        <>
          {store.bufferedContent}
        </>
      );
    }

    send({ type: "CANCEL", cancelNode: nextBufferedContent });

  }, [prompt, send, store.bufferedContent, store.currentLineStatus, store.editorInput, style.lineText, style.preWhiteSpace, themeStyles.themePromptColor]);

  const runCommand = React.useCallback(async () => {
    const [command, ...rest] = store.editorInput.trim().split(" ");
    let output = "";

    if (command === "clear" || command === "cls") {
      send({ type: "CLEAR_BY_COMMAND" });
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
          runningPromiseRef.current = new CancelablePromise((resolve) => {
            resolve(executor(commandArguments))
          });
          output = await runningPromiseRef.current;
        } else {
          output = executor;
        }
      } else if (typeof defaultHandler === "function") {
        runningPromiseRef.current = new CancelablePromise((resolve) => {
          resolve(defaultHandler(command, commandArguments))
        });
        output = await runningPromiseRef.current;
      } else if (typeof errorMessage === "function") {
        runningPromiseRef.current = new CancelablePromise((resolve) => {
          resolve(errorMessage(command, commandArguments))
        });
        output = await runningPromiseRef.current
      } else {
        output = errorMessage;
      }
    }

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
    let nextInput = null;

    if (eventKey === "Enter") {
      if (store.currentLineStatus !== "processing") {
        runCommand();
      }
    } else if (eventKey === "Backspace") {
      if (store.editorInput && store.editorInput.length !== 0) {
        send({ type: "DELETE" });
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
      && eventKey.toLowerCase() === "l"
    ) {
      send({ type: "CLEAR" })
    } else if (
      (event.metaKey || event.ctrlKey)
      && event.shiftKey
      && eventKey.toLowerCase() === "v"
    ) {
      navigator.clipboard.readText().then((pastedText) => {
        send({ type: "PASTE", text: pastedText });
      });
    } else if (
      (event.metaKey || event.ctrlKey)
      && event.shiftKey
      && eventKey.toLowerCase() === "c"
    ) {
      const selectedText = window.getSelection().toString();
      navigator.clipboard.writeText(selectedText).then(() => {
        send({ type: "COPY" });
      });
    } else if (
      (event.metaKey || event.ctrlKey)
      && eventKey.toLowerCase() === "c"
    ) {
      if (runningPromiseRef.current) {
        runningPromiseRef.current.cancel();
      }
      cancelCommand()
    } else {
      if (eventKey && eventKey.length === 1) {
        send({ type: "TYPE", text: eventKey })
      }
    }
  }, [cancelCommand, consoleFocused, enableInput, getNextCommand, getPreviousCommand, runCommand, send, store.caretPosition, store.editorInput]);

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