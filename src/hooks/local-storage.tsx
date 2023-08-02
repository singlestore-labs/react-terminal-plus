
const localStorageSchema = {
    COMMAND_HISTORY: "react-terminal-plus-commandHistory",
} as const;

export const getCommandHistory = (): Array<string> => {
    try {
        const commandHistoryStr = localStorage.getItem(localStorageSchema.COMMAND_HISTORY) ?? "[]";
        return JSON.parse(commandHistoryStr)
    } catch (e) {
        console.error(e);
        return [];
    }
}

export const addCommandToHistory = (command: string) => {
    let commandHistory = getCommandHistory();
    commandHistory.push(command);

    // to make sure this doesn't overgrow more than 1k commands
    if (commandHistory.length > 1000) {
        commandHistory = commandHistory.slice(50);
    }

    localStorage.setItem(localStorageSchema.COMMAND_HISTORY, JSON.stringify(commandHistory))
}

