import * as React from "react";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTerminal } from "../contexts/TerminalContext";
import {
  useCurrentLine,
  useScrollToBottom,
} from "../hooks/editor";

export default function Editor(props: any) {
  const wrapperRef = React.useRef(null);
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);
  const { store } = useTerminal();

  useScrollToBottom(store.bufferedContent, wrapperRef);

  const {
    enableInput,
    caret,
    consoleFocused,
    prompt,
    commands,
    welcomeMessage,
    errorMessage,
    showControlBar,
    defaultHandler
  } = props;

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
    <div id="terminalEditor" ref={wrapperRef} className={`${style.editor} ${!showControlBar ? style.curvedTop : null} ${showControlBar ? style.editorWithTopBar : null}`} style={{ background: themeStyles.themeBGColor }}>
      {welcomeMessage}
      {store.bufferedContent}
      {currentLine}
    </div>
  );
}
