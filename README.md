# Forked version of react-terminal

original repo: https://github.com/bony2023/react-terminal

setting up github repo in gitlab: https://gist.github.com/DavideMontersino/810ebaa170a2aa2d2cad

## Roadmap

Features to add:

- []: Properly styled results - `white-space: pre-wrap;`
- []: Add new native commands like: CTRL+L, CTRL+C
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
