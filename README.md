## Overview

This plugin allows you to add custom URI commands to the command palette. Can bu used with the [Obsidian URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI) and [Advanced Obsidian URI](https://github.com/Vinzent03/obsidian-advanced-uri) plugin, as well as any other URI scheme your computer supports.

Accepts {{fileName}} and {{fileText}} placeholders.

## Examples

### Obsidian
(from [Obsidian docs](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Available+actions) and [Advanced Obsidian URI docs](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Available+actions))
- Open the vault `my vaut`: `obsidian://open?vault=my%20vault`
- Open the note `my note` in the vault `my vault`: `obsidian://open?vault=my%20vault&file=my%20note`
- Append "Hello world" to today's daily note: `obsidian://advanced-uri?vault=&daily=true&data=Hello%20World&mode=append`

### Other programs
- Open google: `https://google.com`
    - Note that for websites, you *must* start it with `https://` or `http://` and not `www.`
- Open an email draft of your current note in your mail client: `mailto:friend@example.com?subject={{fileName}}&body={{fileText}}`
- Open a spotify album: `spotify:album:4niKC11eq7dRXiDVWsTdEy`