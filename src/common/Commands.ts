const CLEAR_COMMANDS = ["clear", "cls"];
export const isClearCommand = (command: string) =>
	CLEAR_COMMANDS.includes(command);
