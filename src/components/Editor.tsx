import * as React from "react";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTerminal } from "../contexts/TerminalContext";
import { useCurrentLine, useScrollToBottom } from "../hooks/editor";
import { MouseEventHandler } from "react";
import type { TerminalMessage, TerminalProps } from "./Terminal";

type EditorProps = {
	enableInput: boolean;
	caret: boolean;
	consoleFocused: boolean;
	prompt: string;
	commands: Record<string, TerminalMessage>;
	welcomeMessage: TerminalMessage;
	errorMessage: TerminalMessage;
	showControlBar: boolean;
	defaultHandler: TerminalProps<any>["defaultHandler"];
	rounded: boolean;
};

export default function Editor(props: EditorProps) {
	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const style = React.useContext(StyleContext);
	const themeStyles = React.useContext(ThemeContext);
	const { store, send } = useTerminal();

	useScrollToBottom(store.bufferedContent, wrapperRef);

	// adds the paste/copy actions to the context menu
	const onMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
		if (!wrapperRef.current) {
			return;
		}

		if (e.button === 2) {
			wrapperRef.current.contentEditable = "true";

			// wait just enough for 'contextmenu' to fire
			setTimeout(() => {
				wrapperRef.current.contentEditable = "false";
			}, 20);
		}
	};

	const onpaste: React.ClipboardEventHandler = (e) => {
		e.preventDefault();
		send({ type: "PASTE", text: e.clipboardData.getData("text") });
	};

	const {
		enableInput,
		caret,
		consoleFocused,
		prompt,
		commands,
		welcomeMessage,
		errorMessage,
		showControlBar,
		defaultHandler,
		rounded,
	} = props;

	const roundedClass = rounded ? style["terminal--rounded"] : "";

	const currentLine = useCurrentLine(
		caret,
		consoleFocused,
		prompt,
		commands,
		errorMessage,
		enableInput,
		defaultHandler,
	);

	return (
		<div
			id="terminalEditor"
			tabIndex={0}
			ref={wrapperRef}
			onMouseDown={onMouseDown}
			onPaste={onpaste}
			className={`${style.editor} ${roundedClass} ${
				showControlBar ? style.editorWithTopBar : null
			}`}
			style={{ background: themeStyles.themeBGColor }}
		>
			<>
				{welcomeMessage}
				{store.bufferedContent}
				{currentLine}
			</>
		</div>
	);
}
