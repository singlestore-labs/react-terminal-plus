import * as React from "react";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTerminal } from "../contexts/TerminalContext";
import { CancelablePromise } from "cancelable-promise";
import { isClearCommand } from "../common/Commands";

export const useEditorInput = ({
	consoleFocused,
	enableInput,
	commands,
	defaultHandler,
	errorMessage,
	prompt,
}: {
	consoleFocused: boolean;
	enableInput: boolean;
	commands: Record<string, string | ((...args: any[]) => any)>;
	defaultHandler?: (...args: any[]) => any;
	errorMessage?: (...args: any[]) => any;
	prompt: string;
}) => {
	const style = React.useContext(StyleContext);
	const themeStyles = React.useContext(ThemeContext);
	const { getPreviousCommand, getNextCommand, store, send } = useTerminal();

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
			nextBufferedContent = <>{store.bufferedContent}</>;
		}

		send({ type: "CANCEL", cancelNode: nextBufferedContent });
	}, [
		prompt,
		send,
		store.bufferedContent,
		store.currentLineStatus,
		store.editorInput,
		style.lineText,
		style.preWhiteSpace,
		themeStyles.themePromptColor,
	]);

	const runCommand = React.useCallback(async () => {
		const [commandWithoutArgs, ...rest] = store.editorInput.trim().split(" ");
		const fullCommand = store.editorInput.trim();
		let output = "";

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
		send({ type: "SUBMIT", loaderNode: waiting, command: fullCommand });
		if (isClearCommand(fullCommand)) {
			return;
		}

		if (store.editorInput) {
			const commandArguments = rest.join(" ");

			if (fullCommand && commands[fullCommand]) {
				const executor = commands[fullCommand];
				if (typeof executor === "function") {
					runningPromiseRef.current = new CancelablePromise((resolve) => {
						resolve(executor(commandArguments));
					});
					output = await runningPromiseRef.current;
				} else {
					output = executor;
				}
			} else if (typeof defaultHandler === "function") {
				runningPromiseRef.current = new CancelablePromise((resolve) => {
					resolve(defaultHandler(commandWithoutArgs, commandArguments));
				});
				output = await runningPromiseRef.current;
			} else if (typeof errorMessage === "function") {
				runningPromiseRef.current = new CancelablePromise((resolve) => {
					resolve(errorMessage(commandWithoutArgs, commandArguments));
				});
				output = await runningPromiseRef.current;
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

	const handleKeyDownEvent = React.useCallback(
		(event: KeyboardEvent) => {
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
				if (nextInput) {
					send({ type: "ARROW_UP", previousCommand: nextInput });
				}
			} else if (eventKey === "ArrowDown") {
				nextInput = getNextCommand();
				if (nextInput) {
					send({ type: "ARROW_DOWN", nextCommand: nextInput });
				} else {
					send({ type: "RESET_CARET_POSITION" });
				}
			} else if ((event.metaKey || event.ctrlKey) && eventKey === "ArrowLeft") {
				send({ type: "BACKWARD_WORD" });
			} else if ((event.metaKey || event.ctrlKey) && eventKey == "ArrowRight") {
				send({ type: "FORWARD_WORD" });
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
				(event.metaKey || event.ctrlKey) &&
				eventKey.toLowerCase() === "l"
			) {
				send({ type: "CLEAR" });
			} else if (
				(event.metaKey || event.ctrlKey) &&
				eventKey.toLowerCase() === "v"
			) {
				navigator.clipboard.readText().then((pastedText) => {
					send({ type: "PASTE", text: pastedText });
				});
			} else if (
				(event.metaKey || event.ctrlKey) &&
				eventKey.toLowerCase() === "c"
			) {
				const selectedText = window.getSelection().toString();
				if (selectedText) {
					navigator.clipboard.writeText(selectedText).then(() => {
						send({ type: "COPY" });
					});
				} else {
					cancelCommand();
				}
			} else if (
				((event.metaKey || event.ctrlKey) && eventKey.toLowerCase() == "a") ||
				eventKey === "Home"
			) {
				send({ type: "MOVE_CARET_TO_START" });
			} else if (
				((event.metaKey || event.ctrlKey) && eventKey.toLowerCase() == "e") ||
				eventKey === "End"
			) {
				send({ type: "MOVE_CARET_TO_END" });
			} else {
				if (eventKey && eventKey.length === 1) {
					send({ type: "TYPE", text: eventKey });
				}
			}
		},
		[
			cancelCommand,
			consoleFocused,
			enableInput,
			getNextCommand,
			getPreviousCommand,
			runCommand,
			send,
			store.caretPosition,
			store.currentLineStatus,
			store.editorInput,
		],
	);

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

	const characterUnderCaret = store.textAfterCaret[0];
	const restTextAfterCaret = store.textAfterCaret.slice(1);

	const showingCaret = consoleFocused && caret;

	const currentLine =
		store.currentLineStatus !== "processing" ? (
			<>
				<span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
				<div className={style.lineText}>
					<span className={style.preWhiteSpace}>{store.textBeforeCaret}</span>
					{showingCaret ? ( // if caret isn't true, caret won't be displayed
						<span className={style.caret}>
							<span
								className={style.caretAfter}
								style={{ background: themeStyles.themeColor }}
							/>
						</span>
					) : null}
					<span className={`${style.preWhiteSpace}`}>
						<span
							style={{
								color: showingCaret
									? themeStyles.themeBGColor
									: themeStyles.themeColor, // apply different color to the letter under the caret
							}}
							className={style.charUnderCaret}
						>
							{characterUnderCaret}
						</span>
						{restTextAfterCaret}
					</span>
				</div>
			</>
		) : (
			<>
				<div className={style.lineText}>
					{showingCaret ? ( // if caret isn't true, caret won't be displayed
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

	useEditorInput({
		commands,
		errorMessage,
		defaultHandler,
		enableInput,
		prompt,
		consoleFocused,
	});

	return currentLine;
};

export const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
	React.useEffect(() => {
		if (!wrapperRef.current) {
			return;
		}
		// eslint-disable-next-line no-param-reassign
		wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
	}, [changesToWatch]);
};
