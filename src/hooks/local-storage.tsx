// this is chrome's limit for local storage for a given key
const CHROME_LOCAL_STORAGE_KEY_LIMIT = 5200000;

const localStorageSchema = {
	COMMAND_HISTORY: "react-terminal-plus-commandHistory",
} as const;

export const getCommandHistory = (): Array<string> => {
	try {
		const commandHistoryStr =
			localStorage.getItem(localStorageSchema.COMMAND_HISTORY) ?? "[]";
		return JSON.parse(commandHistoryStr);
	} catch (e) {
		console.error(e);
		return [];
	}
};

export const addCommandToHistory = (command: string) => {
	let commandHistory = getCommandHistory();
	commandHistory.push(command);

	try {
		// to make sure this doesn't overgrow more than the browsers' limit
		// https://stackoverflow.com/a/61018107
		if (
			JSON.stringify(commandHistory).length > CHROME_LOCAL_STORAGE_KEY_LIMIT
		) {
			commandHistory = commandHistory.slice(50);
		}

		localStorage.setItem(
			localStorageSchema.COMMAND_HISTORY,
			JSON.stringify(commandHistory),
		);
	} catch (e) {
		console.error(e);
		commandHistory = [command];
		localStorage.setItem(
			localStorageSchema.COMMAND_HISTORY,
			JSON.stringify(commandHistory),
		);
	}
};
