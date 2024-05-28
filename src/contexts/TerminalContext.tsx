import * as React from "react";
import { isClearCommand } from "../common/Commands";
import Utils from "../common/Utils";
import { addCommandToHistory, getCommandHistory } from "../hooks/local-storage";

type ProcessingStatus = "idle" | "processing" | "success" | "error";

type TerminalState = {
	bufferedContent: React.ReactNode;
	editorInput: string;
	currentLineStatus: ProcessingStatus;
	caretPosition: number;
	textBeforeCaret: string;
	textAfterCaret: string;
	commandsHistory: string[];
};

type TerminalActions =
	| { type: "CLEAR" }
	| { type: "CANCEL"; cancelNode: React.ReactNode }
	| { type: "SUBMIT"; loaderNode: React.ReactNode; command: string }
	| { type: "SUBMIT_SUCCESS"; successNode: React.ReactNode }
	| { type: "TYPE"; text: string }
	| { type: "DELETE" }
	| { type: "COPY" }
	| { type: "PASTE"; text: string }
	| { type: "ARROW_UP"; previousCommand: string }
	| { type: "ARROW_DOWN"; nextCommand: string }
	| { type: "ARROW_LEFT" }
	| { type: "ARROW_RIGHT" }
	| { type: "RESET_CARET_POSITION" }
	| { type: "MOVE_CARET_TO_START" }
	| { type: "MOVE_CARET_TO_END" }
	| { type: "FORWARD_WORD" }
	| { type: "BACKWARD_WORD" }
	| { type: "UPDATE_BUFFERED_CONTENT"; payload: React.ReactNode };

type TerminalContextState = {
	send: React.Dispatch<TerminalActions>;
	store: TerminalState;
	getPreviousCommand: () => string;
	getNextCommand: () => string;
};

const TerminalContext = React.createContext<TerminalContextState>(null);

function terminalReducer(
	state: TerminalState,
	action: TerminalActions,
): TerminalState {
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
					const newCommands = [...state.commandsHistory];
					if (command && command !== newCommands[newCommands.length - 1]) {
						newCommands.push(command);
						addCommandToHistory(command);
					}

					if (isClearCommand(command)) {
						return {
							...state,
							commandsHistory: newCommands,
							bufferedContent: null,
							editorInput: "",
							currentLineStatus: "idle",
							caretPosition: 0,
							textBeforeCaret: "",
							textAfterCaret: "",
						};
					}

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
					const [oldCaretTextBefore, oldCaretTextAfter] =
						caretTextBeforeUpdate(state);

					const newEditorInput =
						oldCaretTextBefore + action.text + oldCaretTextAfter;
					const newCaretPosition = state.caretPosition + 1;

					const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
						newEditorInput,
						newCaretPosition,
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
					const [oldCaretTextBefore, oldCaretTextAfter] =
						caretTextBeforeUpdate(state);

					const newEditorInput =
						oldCaretTextBefore.slice(0, -1) + oldCaretTextAfter;
					const newCaretPosition = state.caretPosition - 1;

					const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
						newEditorInput,
						newCaretPosition,
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
					const [oldCaretTextBefore, oldCaretTextAfter] =
						caretTextBeforeUpdate(state);

					const newEditorInput =
						oldCaretTextBefore + action.text + oldCaretTextAfter;
					const newCaretPosition = state.caretPosition + action.text.length;

					const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
						newEditorInput,
						newCaretPosition,
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
						newCaretPosition,
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
						newCaretPosition,
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
						editorInput: "",
						textBeforeCaret: "",
						textAfterCaret: "",
						caretPosition: 0,
					};
				}
				case "ARROW_LEFT": {
					const newCaretPosition = state.caretPosition - 1;

					const [newCaretTextBefore, newCaretTextAfter] = caretTextAfterUpdate(
						state.editorInput,
						newCaretPosition,
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
						newCaretPosition,
					);

					return {
						...state,
						caretPosition: newCaretPosition,
						textAfterCaret: newCaretTextAfter,
						textBeforeCaret: newCaretTextBefore,
					};
				}
				case "FORWARD_WORD": {
					const [newCaretTextBefore, newCaretTextAfter] =
						moveCaretForwardByOneWord(state.editorInput, state.caretPosition);
					return {
						...state,
						caretPosition: newCaretTextBefore.length,
						textAfterCaret: newCaretTextAfter,
						textBeforeCaret: newCaretTextBefore,
					};
				}
				case "BACKWARD_WORD": {
					const [newCaretTextBefore, newCaretTextAfter] =
						moveCaretBackwardByOneWord(state.editorInput, state.caretPosition);
					return {
						...state,
						caretPosition: newCaretTextBefore.length,
						textAfterCaret: newCaretTextAfter,
						textBeforeCaret: newCaretTextBefore,
					};
				}
				case "MOVE_CARET_TO_START": {
					return {
						...state,
						caretPosition: 0,
						textAfterCaret: state.editorInput,
						textBeforeCaret: "",
					};
				}
				case "MOVE_CARET_TO_END": {
					return {
						...state,
						caretPosition: state.editorInput.length,
						textAfterCaret: "",
						textBeforeCaret: state.editorInput,
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

function moveCaretForwardByOneWord(
	newEditorInput: string,
	newCaretPosition: number,
) {
	const [caretTextBefore, caretTextAfter] = Utils.splitStringAtNextSpace(
		newEditorInput,
		newCaretPosition,
	);
	return [caretTextBefore, caretTextAfter];
}

function moveCaretBackwardByOneWord(
	newEditorInput: string,
	newCaretPosition: number,
) {
	const [caretTextBefore, caretTextAfter] = Utils.splitStringAtPreviousSpace(
		newEditorInput,
		newCaretPosition,
	);
	return [caretTextBefore, caretTextAfter];
}

function caretTextBeforeUpdate(state: TerminalState) {
	const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(
		state.editorInput,
		state.caretPosition,
	);

	return [caretTextBefore, caretTextAfter];
}

function caretTextAfterUpdate(
	newEditorInput: string,
	newCaretPosition: number,
) {
	const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(
		newEditorInput,
		newCaretPosition,
	);

	return [caretTextBefore, caretTextAfter];
}

type TerminalContextProviderProps = {
	children: React.ReactNode;
	useLocalStorage?: boolean;
};

export function TerminalContextProvider({
	children,
	useLocalStorage = true,
}: TerminalContextProviderProps) {
	const [historyPointer, setHistoryPointer] = React.useState<number | null>(
		null,
	);

	const initialState: TerminalState = {
		bufferedContent: null,
		commandsHistory: useLocalStorage ? getCommandHistory() : [],
		editorInput: "",
		currentLineStatus: "idle",
		caretPosition: 0,
		textBeforeCaret: "",
		textAfterCaret: "",
	};

	const [store, send] = React.useReducer(terminalReducer, initialState);

	const sendWrapper = React.useCallback(
		(action: TerminalActions) => {
			// Reset history pointer on submit
			if (action.type === "SUBMIT") {
				setHistoryPointer(store.commandsHistory.length);
			}

			send(action);
		},
		[store.commandsHistory.length],
	);

	React.useEffect(() => {
		setHistoryPointer(store.commandsHistory.length);
	}, [store.commandsHistory.length]);

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
			send: sendWrapper,
			store,
			getPreviousCommand,
			getNextCommand,
		};
	}, [historyPointer, sendWrapper, store]);

	return (
		<TerminalContext.Provider value={contextValue}>
			{children}
		</TerminalContext.Provider>
	);
}
export function useTerminal() {
	const context = React.useContext(TerminalContext);
	if (context === undefined) {
		throw new Error(
			"useTerminal must be used within a TerminalContextProvider",
		);
	}
	return context;
}

export default {
	TerminalContext,
	TerminalContextProvider,
};
