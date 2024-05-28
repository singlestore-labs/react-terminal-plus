export default class Utils {
	static splitStringAtIndex(value: string, index: number) {
		if (!value) {
			return ["", ""];
		}
		return [value.substring(0, index), value.substring(index)];
	}

	static splitStringAtNextSpace(value: string, index: number) {
		if (!value) {
			return ["", ""];
		}
		let nextSpacePos = value.indexOf(" ", index);
		// If there is no space after the index, return the whole string
		if (nextSpacePos === -1) {
			nextSpacePos = value.length;
		}
		// Skip all consecutive spaces
		while (nextSpacePos < value.length && value[nextSpacePos] === " ") {
			nextSpacePos++;
		}
		return [value.substring(0, nextSpacePos), value.substring(nextSpacePos)];
	}

	static splitStringAtPreviousSpace(value: string, index: number) {
		if (!value) {
			return ["", ""];
		}
		// Find the position of the previous space
		// trimEnd() is used to remove any trailing spaces
		let prevSpacePos = value.substring(0, index).trimEnd().lastIndexOf(" ");
		if (prevSpacePos === -1 || prevSpacePos === 0) {
			prevSpacePos = 0;
		} else {
			// move the position to the next character after the space
			prevSpacePos = prevSpacePos + 1;
		}
		return [value.substring(0, prevSpacePos), value.substring(prevSpacePos)];
	}
}
