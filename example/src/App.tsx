import * as React from "react";
import "./App.css";
import {
	TerminalContextProvider,
	ReactTerminal,
} from "react-terminal-plus-local";

export const App = () => {
	const [theme, setTheme] = React.useState<any>("dark");
	const [controlBar, setControlBar] = React.useState(true);
	const [controlButtons, setControlButtons] = React.useState(true);
	const [prompt, setPrompt] = React.useState(">>>");

	const commands = {
		help: (
			<span>
				<strong>clear</strong> - clears the console. <br />
				<strong>change_prompt &lt;PROMPT&gt;</strong> - Change the prompt of the
				terminal. <br />
				<strong>change_theme &lt;THEME&gt;</strong> - Changes the theme of the
				terminal. Allowed themes - light, dark, material-light, material-dark,
				material-ocean, matrix and dracula. <br />
				<strong>toggle_control_bar</strong> - Hides / Display the top control
				bar. <br />
				<strong>toggle_control_buttons</strong> - Hides / Display the top
				buttons on control bar. <br />
				<strong>evaluate_math_expression &lt;EXPR&gt;</strong> - Evaluates a
				mathematical expression (eg, <strong>4*4</strong>) by hitting a public
				API, api.mathjs.org.
			</span>
		),

		change_prompt: (prompt: string) => {
			setPrompt(prompt);
		},

		change_theme: (theme: any) => {
			const validThemes = [
				"light",
				"dark",
				"material-light",
				"material-dark",
				"material-ocean",
				"matrix",
				"dracula",
			];
			if (!validThemes.includes(theme)) {
				return `Theme ${theme} not valid. Try one of ${validThemes.join(", ")}`;
			}
			setTheme(theme);
		},

		toggle_control_bar: () => {
			setControlBar(!controlBar);
		},

		toggle_control_buttons: () => {
			setControlButtons(!controlButtons);
		},

		evaluate_math_expression: async (expr: string) => {
			const response = await fetch(
				`https://api.mathjs.org/v4/?expr=${encodeURIComponent(expr)}`,
			);
			return await response.text();
		},
	};

	const welcomeMessage = (
		<span>
			Type "help" for all available commands. <br />
		</span>
	);

	const defaultHandler = (): Promise<any> =>
		new Promise((resolve) => {
			setTimeout(() => resolve("hello"), 1000);
		});

	return (
		<>
			<h1>Local Version</h1>
			<div className="App">
				<TerminalContextProvider>
					<ReactTerminal
						prompt={prompt}
						theme={"dracula"}
						showControlBar={controlBar}
						showControlButtons={controlButtons}
						welcomeMessage={welcomeMessage}
						commands={commands}
						defaultHandler={defaultHandler}
					/>
				</TerminalContextProvider>
			</div>
		</>
	);
};
