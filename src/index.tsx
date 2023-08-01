import * as React from "react";
import * as Terminal from "./components/Terminal";
import * as ContextProvider from "./contexts";
import { TerminalContextProvider as _TerminalContextProvider } from "./contexts/TerminalContext";
import type { TerminalProps } from "./components/Terminal";

export function ReactTerminal(props: TerminalProps) {
  return (
    <ContextProvider.default>
      <Terminal.default {...props} />
    </ContextProvider.default>
  );
}

export const TerminalContextProvider = _TerminalContextProvider;

export default {
  ReactTerminal,
  TerminalContextProvider
};
