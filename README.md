## Overview

This plugin allows you to add custom URI commands to the command palette. Can be used with the [Obsidian URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI), as well as any other URI scheme your computer supports.

Accepts {{fileName}}, {{fileText}}, and {{selection}} placeholders.

## Examples

### Obsidian
- Open the vault `work vaut`: `obsidian://open?vault=work%20vault`
- Open the note `hotkey reference` in the vault `my vault`: `obsidian://open?vault=my%20vault&file=hotkey%20reference`
- Append your selection to today's daily note (requires Advanced URI plugin): `obsidian://advanced-uri?vault=&daily=true&data={{selection}}&mode=append`
- Open this plugin's settings page (requires Hotkey Helper plugin): `obsidian://goto-plugin?id=uri-commands&show=config`

### Other programs
- Open an email draft of your current note in your mail client: `mailto:friend@example.com?subject={{fileName}}&body={{fileText}}`
- [Email your current note to Roam](http://www.sendtoroam.com/): `mailto:me@sendtoraom.com?subject={{fileName}}&body={{fileText}}`
- Open a spotify album: `spotify:album:4niKC11eq7dRXiDVWsTdEy`
- Open a new [HackMD](https://hackmd.io/) collaborative markdown pad: `https://hackmd.io/new`
    - Note that for websites, you *must* start your URI with `https://` or `http://`, not `www.`
- Open the wikipedia page for your current slection: `https://en.wikipedia.org/wiki/{{selection}}`

## Related plugins
- [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri): enables URIs for daily note, appending text to a file, jump to heading, search and replace, and more
- [Hotkey Helper](https://github.com/pjeby/hotkey-helper): enables Obsidian URIs for plugin READMEs, settings, and hotkey configurations

## Help
For more information on URIs in Obsidian, see the [Obsidian documentation](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI). An incomplete list of other URI schemes can be found [here](https://en.wikipedia.org/wiki/List_of_URI_schemes).

I have not tested [these](https://github.com/bhagyas/app-urls) [two](https://www.techregister.co.uk/always-updated-list-of-ios-app-url-scheme-names-paths-for-shortcuts-ios-iphone-gadget-hacks/) lists of iOS URIs, but they seem very thorough.

## Thanks
Parts of this code, especially the icon picker, borrow heavily from [phibr0](https://github.com/phibr0)'s plugins, including [Obsidian Macros](https://github.com/phibr0/obsidian-macros) and [Customizable Sidebar](https://github.com/phibr0/obsidian-customizable-sidebar).