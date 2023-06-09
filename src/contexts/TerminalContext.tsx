import * as React from "react";
import Utils from "../common/Utils";

type ProcessingStatus = "idle" | "processing" | "success" | "error";

// delete | write | arrowUp | arrowDown | submit | read | clear | copy | paste

type TerminalState = {
  bufferedContent: React.ReactNode;
  editorInput: string;
  currentLineStatus: ProcessingStatus;
  caretPosition: number;
  textBeforeCaret: string;
  textAfterCaret: string;
  commandsHistory: string[];
}

type TerminalActions =
  { type: "CLEAR" }
  | { type: "CLEAR_BY_COMMAND" }
  | { type: "CANCEL", cancelNode: React.ReactNode }
  | { type: "SUBMIT", loaderNode: React.ReactNode, command: string }
  | { type: "SUBMIT_SUCCESS", successNode: React.ReactNode }
  | { type: "TYPE", text: string }
  | { type: "DELETE" }
  | { type: "COPY" }
  | { type: "PASTE", text: string }
  | { type: "ARROW_UP", previousCommand: string }
  | { type: "ARROW_DOWN", nextCommand: string }
  | { type: "ARROW_LEFT" }
  | { type: "ARROW_RIGHT" }
  | { type: "RESET_CARET_POSITION" }
  | { type: "UPDATE_BUFFERED_CONTENT", payload: React.ReactNode }

type TerminalContextState = {
  send: React.Dispatch<TerminalActions>,
  store: TerminalState,
  getPreviousCommand: () => string,
  getNextCommand: () => string,
}

const TerminalContext = React.createContext<TerminalContextState>(null);

function terminalReducer(state: TerminalState, action: TerminalActions): TerminalState {
  switch (state.currentLineStatus) {
    case "processing": {
      switch (action.type) {
        case "CANCEL": {
          return {
            ...state,
            bufferedContent: action.cancelNode,
            editorInput: "",
            currentLineStatus: "idle",
            caretPosition: 0,
            textBeforeCaret: "",
            textAfterCaret: "",
          };
        }
        case "SUBMIT_SUCCESS": {
          return {
            ...state,
            bufferedContent: action.successNode,
            currentLineStatus: "success",
            editorInput: "",
            caretPosition: 0,
            textBeforeCaret: "",
            textAfterCaret: "",
          };
        }
        default: {
          return state;
        }
      }
    }
    case "success":
    case "error":
    case "idle": {
      switch (action.type) {
        case "CLEAR_BY_COMMAND": {
          return {
            ...state,
            bufferedContent: null,
            editorInput: "",
            currentLineStatus: "idle",
            caretPosition: 0,
            textBeforeCaret: "",
            textAfterCaret: "",
          };
        }
        case "CLEAR": {
          return {
            ...state,
            bufferedContent: null,
          };
        }
        case "CANCEL": {
          return {
            ...state,
            bufferedContent: action.cancelNode,
            editorInput: "",
            currentLineStatus: "idle",
            caretPosition: 0,
            textBeforeCaret: "",
            textAfterCaret: "",
          };
        }
        case "SUBMIT": {
          const { command } = action;
          const newCommands = command ? [...state.commandsHistory, command] : state.commandsHistory;

          return {
            ...state,
            commandsHistory: newCommands,
            bufferedContent: action.loaderNode,
            currentLineStatus: "processing",
            editorInput: "",
            caretPosition: 0,
            textBeforeCaret: "",
            textAfterCaret: "",
          };
        }
        case "TYPE": {
          const [oldCaretTextBefore, oldCaretTextAfter] = caretTextBeforeUpdate(state);

          const newEditorInput = oldCaretTextBefore + action.text + oldCaretTextAfter;
          const newCaretPosition = state.caretPosition + 1;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            newEditorInput,
            newCaretPosition
          );

          return {
            ...state,
            caretPosition: newCaretPosition,
            editorInput: newEditorInput,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        case "DELETE": {
          const [oldCaretTextBefore, oldCaretTextAfter] = caretTextBeforeUpdate(state);

          const newEditorInput = oldCaretTextBefore.slice(0, -1) + oldCaretTextAfter;
          const newCaretPosition = state.caretPosition - 1;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            newEditorInput,
            newCaretPosition
          );

          return {
            ...state,
            editorInput: newEditorInput,
            caretPosition: newCaretPosition,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        case "COPY": {
          return state;
        }
        case "PASTE": {
          const [oldCaretTextBefore, oldCaretTextAfter] = caretTextBeforeUpdate(state);

          const newEditorInput = oldCaretTextBefore + action.text + oldCaretTextAfter;
          const newCaretPosition = state.caretPosition + action.text.length;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            newEditorInput,
            newCaretPosition
          );

          return {
            ...state,
            editorInput: newEditorInput,
            caretPosition: newCaretPosition,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        case "ARROW_UP": {
          const newEditorInput = action.previousCommand;
          const newCaretPosition = action.previousCommand.length;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            newEditorInput,
            newCaretPosition
          );

          return {
            ...state,
            editorInput: newEditorInput,
            caretPosition: newCaretPosition,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        case "ARROW_DOWN": {
          const newEditorInput = action.nextCommand;
          const newCaretPosition = action.nextCommand.length;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            newEditorInput,
            newCaretPosition
          );

          return {
            ...state,
            editorInput: newEditorInput,
            caretPosition: newCaretPosition,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        case "RESET_CARET_POSITION": {
          return {
            ...state,
            textBeforeCaret: "",
            textAfterCaret: "",
            caretPosition: 0,
          };
        }
        case "ARROW_LEFT": {
          const newCaretPosition = state.caretPosition - 1;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            state.editorInput,
            newCaretPosition
          );

          return {
            ...state,
            caretPosition: newCaretPosition,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        case "ARROW_RIGHT": {
          const newCaretPosition = state.caretPosition + 1;

          const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
            state.editorInput,
            newCaretPosition
          );

          return {
            ...state,
            caretPosition: newCaretPosition,
            textAfterCaret: newCaretTextAfter,
            textBeforeCaret: newCaretTextBefore,
          };
        }
        default: {
          throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
        }
      }
    }
    default: {
      return state;
    }
  }

}

function caretTextBeforeUpdate(state: TerminalState) {
  const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(
    state.editorInput,
    state.caretPosition
  );

  return [caretTextBefore, caretTextAfter];
}

function caretTextAfterUpdate(newEditorInput: string, newCaretPosition: number) {
  const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(
    newEditorInput,
    newCaretPosition
  );

  return [caretTextBefore, caretTextAfter];
}

const initialState: TerminalState = {
  bufferedContent: null,
  commandsHistory: [],
  editorInput: "",
  currentLineStatus: "idle",
  caretPosition: 0,
  textBeforeCaret: "",
  textAfterCaret: "",
};

export function TerminalContextProvider(props: any) {
  const { children } = props;
  const [historyPointer, setHistoryPointer] = React.useState(null);

  const [store, send] = React.useReducer(terminalReducer, initialState);

  React.useEffect(() => {
    setHistoryPointer(store.commandsHistory.length);
  }, [store.commandsHistory]);

  const contextValue = React.useMemo(() => {
    const getPreviousCommand = () => {
      if (historyPointer === 0) {
        if (store.commandsHistory.length === 0) {
          return "";
        }

        return store.commandsHistory[0];
      }

      const command = store.commandsHistory[historyPointer - 1];
      if (historyPointer > 0) {
        setHistoryPointer(historyPointer - 1);
      }

      return command;
    };

    const getNextCommand = () => {
      if (historyPointer + 1 <= store.commandsHistory.length) {
        const command = store.commandsHistory[historyPointer + 1];
        setHistoryPointer(historyPointer + 1);
        return command;
      }

      return "";
    };

    return {
      send,
      store,
      getPreviousCommand,
      getNextCommand
    };
  }, [historyPointer, store]);

  return (
    <TerminalContext.Provider
      value={contextValue}
    >
      {children}
    </TerminalContext.Provider>
  );
}
export function useTerminal() {
  const context = React.useContext(TerminalContext);
  if (context === undefined) {
    throw new Error("useTerminal must be used within a TerminalContextProvider");
  }
  return context;
}

export default {
  TerminalContext,
  TerminalContextProvider
};
