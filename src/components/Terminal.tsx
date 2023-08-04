import * as React from "react";
import { NoInfer } from "../common/Types";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useClickOutsideEvent } from "../hooks/terminal";
import { DefaultThemes } from "../themes";

import Controls from "./Controls";
import Editor from "./Editor";

type TerminalMessage = string | React.ReactNode | Function;
type ThemeSchema = {
  /*
    * The background color of the terminal
  */
  themeBGColor: string,
  /*
    * The background color of the toolbar
  */
  themeToolbarColor: string,
  /*
    * The color of the prompt that prepends each line
  */
  themePromptColor: string,
  /*
   * The color of text in the terminal
 */
  themeColor: string,
}

export type TerminalProps<ThemesT extends string> = {
  enableInput?: boolean,
  caret?: boolean,
  showControlBar?: boolean,
  showControlButtons?: boolean,
  controlButtonLabels?: string[],
  prompt?: string,
  commands?: Record<string, TerminalMessage>,
  welcomeMessage?: TerminalMessage,
  errorMessage?: TerminalMessage,
  themes?: Record<ThemesT, Partial<ThemeSchema>>,
  theme?: NoInfer<ThemesT> | DefaultThemes,
  defaultHandler?: (command: string, commandArguments: string) => TerminalMessage | Promise<TerminalMessage>,
}

export default function Terminal<ThemesT extends string>(props: TerminalProps<ThemesT>) {
  const wrapperRef = React.useRef(null);
  const [consoleFocused, setConsoleFocused] = React.useState(true);
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);

  useClickOutsideEvent(wrapperRef, consoleFocused, setConsoleFocused);

  // Get all props destructively
  const {
    caret = true,
    theme = "light",
    showControlBar = true,
    showControlButtons = true,
    controlButtonLabels = ["close", "minimize", "maximize"],
    prompt = ">>>",
    commands = {},
    welcomeMessage = "",
    errorMessage = "not found!",
    enableInput = true,
    defaultHandler = null,
  } = props;

  const controls = showControlBar ? <Controls
    consoleFocused={consoleFocused}
    showControlButtons={showControlButtons}
    controlButtonLabels={controlButtonLabels} /> : null;

  const editor = <Editor
    caret={caret}
    consoleFocused={consoleFocused}
    prompt={prompt}
    commands={commands}
    welcomeMessage={welcomeMessage}
    errorMessage={errorMessage}
    enableInput={enableInput}
    showControlBar={showControlBar}
    defaultHandler={(defaultHandler)}
  />

  return (
    <div
      ref={wrapperRef}
      id={style.terminalContainer}
      className={style[`theme--${theme}`]}
      data-testid="terminal"
    >
      <div className={`${style.terminal}`} style={{ background: themeStyles.themeToolbarColor, color: themeStyles.themeColor }}>
        {controls}
        {editor}
      </div>
    </div>
  );
}