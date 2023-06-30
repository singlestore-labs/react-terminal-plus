## 0.0.5 (30th June 2023)

### Changed

- The scrollbar styles were changed to be more according to a terminal
- The scrollbar is only visible when the terminal is focused/hovered

## 0.0.4 (23rd June 2023)

### Fixes

- Don't allow two consecutive duplicated commands in the commands history
- Reset the command history pointer on "clear" command
- Allow the `clear` and `cls` command to be saved in commands history

## 0.0.3 (9th June 2023)

### Fixes

- Don't allow any commands to be executed while another command is running
- Fix a small UI bug when doing `ctrl + c` with text in the buffer

## 0.0.2 (7th June 2023)

### Internal

- Add tooling for changelogs and releasing

## 0.0.1 (7th June 2023)

### Added

- `ctrl + c` shortcut to stop the command execution
- `Ctrl + L` shortcut to to clear the terminal
- `cls` command to clear the terminal

### Changed

- Shortcut to copy is now `ctrl + shift + c` instead of `ctrl + c`
- Shortcut to paste is now `ctrl + shift + v` instead of `ctrl + v`
- The terminal cursor no longer blinks

### Internal

- Refactored the code to rely on a `reducer` architecture instead of `useState + useEffect`

https://docs.gitlab.com/ee/development/changelog.html
