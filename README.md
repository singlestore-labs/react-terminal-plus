# Forked version of react-terminal

original repo: https://github.com/bony2023/react-terminal

setting up github repo in gitlab: https://gist.github.com/DavideMontersino/810ebaa170a2aa2d2cad

## Roadmap

Features to add:

- [X]: Properly styled results - `white-space: pre-wrap;`
- [X]: Add new native commands like: CTRL+L, CTRL+C
- []: Hook to run controlled commands - e.g useTerminal()
- []: Allow highlighting of text with keyboard

### New Commands

- cls => same as clear

### New Shortcuts

CTRL + C
CTRL + L

### Required to launch

- Cancel command shortcut (or at least button)

### To Look At

- blinking cursor (maybe too fast)
- look into colors highlights
- a way to copy everything
- save buffer to local-storage

### Portal Stuff

- allow eval on portal - iframe isolate?
- connection state info
- firewall rules

### Timeline 4 weeks / 5 June - 2 July

week 1/2

1. Implement "cancel running command" shortcut => Ctrl + C
1. Add `cls` command => same as clear
1. Allow eval on portal - iframe isolate?
1. Hide Mongo Terminal it behind employee flag for internal testing

---

week 3/4 (if time permits)

1. a way to copy everything
1. save buffer to local-storage
1. apply colors highlights

## Terminal Features

- [X]: Copy Pasting through keyboard - Ctrl+c/Ctrl+V
- [X]: Copy Pasting through browser's context menu - Right Click
- [X]: Cancel running command with Ctrl+C
- [X]: Clear terminal with Ctrl+L
- [X]: Add `cls` command to clear terminal
- [X]: Localstorage support for commands history

## TODO

- check the algorithm behind localstorage command history cleanup
- moving in command history should only show commands that match what's already written in the terminal
- inversion of control for the terminal - allow controlled commands
- allow highlighting of text with keyboard

## Mongo Shell in Portal - Missing Features

- [X]: Talk with Francisco about the portal's security concerns
- [X]: Bug showing the connected database - urgent
- [X]: colors/font-size/line-height - urgent
- [X]: Terminal background color - talk with Design
- [X]: Integrate into the tutorial?? - later
- [1]: Blocklist commands - [window, ...]
- [X]: Look at analytics
- [2]: Only show mongo shell if there are workspaces with KAI enabled - let's hide for now
- [2]: Look at firewall rules - try
- [2]: Talk with Design about including a "don't copy paste" warning - later
- []: ???
