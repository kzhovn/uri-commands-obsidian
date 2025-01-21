## Overview
This plugin allows you to add custom URI commands to the command palette. Can be used with the [Obsidian URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI), as well as any other URI scheme your computer supports.

### Placeholders
You can use the placeholders below in your URI. All of these are [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding) for you unless you turn off URL-encoding, so you don't need to worry about your text having any unescaped illegal or reserved characters.

All commands with placeholders are hidden when there is no active file.

| Placeholder         | Description                                                                                                                                                                                                                                                                                                                                         |     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| {{fileName}}        | Just the base name of the file, without the filepath or file extension.                                                                                                                                                                                                                                                                             |     |
| {{filePath}}            | Path, relative to the vault, to the current file. E.g. `FolderName/filename.md`                                                                                                                                                                                                                                                                                                                             |     |
| {{fileText}}        | Entire contents of the file, including frontmatter. Available only in markdown files.                                                                                                                                                                                                                                                               |     |
| {{selection}}       | Your current selection. If nothing is selected, placeholder is replaced by the empty string.                                                                                                                                                                                                                                         |     |
| {{line}}            | Current line.                                                                                                                                                                                                                                                                                                                                       |     |
| {{vaultName}}            | Name of the current vault.                                                                                                                                                                                                                                                                                                               |     |
| {{meta:FIELD_NAME}} | The value of the metadata field corresponding to FIELD_NAME. Note that if there are multiple values in one field (as a comma-separated list or [array]), the values in the field will be inserted in the URI as a comma-separated list. Requires MetaEdit. |     |

## Examples
### Obsidian
- Open the vault `work vault`: `obsidian://open?vault=work%20vault`
- Open the note `hotkey reference` in the vault `my vault`: `obsidian://open?vault=my%20vault&file=hotkey%20reference`
- Append your selection to today's daily note (requires Advanced URI plugin): `obsidian://advanced-uri?vault=&daily=true&data={{selection}}&mode=append`
- Open this plugin's settings page (requires Hotkey Helper plugin): `obsidian://goto-plugin?id=uri-commands&show=config`

### Other programs
- Open an email draft of your current note in your mail client: `mailto:friend@example.com?subject={{fileName}}&body={{fileText}}`
- [Email your current note to Roam](http://www.sendtoroam.com/): `mailto:me@sendtoroam.com?subject={{fileName}}&body={{fileText}}`
- Open a spotify album: `spotify:album:4niKC11eq7dRXiDVWsTdEy`
- Open a new [HackMD](https://hackmd.io/) collaborative markdown pad: `https://hackmd.io/new`
    - Note that for websites, you *must* start your URI with `https://` or `http://`, not `www.`
- Open the wikipedia page for the contents of the YAML field "topic": `https://en.wikipedia.org/wiki/{{meta:topic}}`
- Look up your selection in your Calibre library: `calibre://search/_?q={{selection}}`
- Open the url in the "external-link" metadata field: `{{meta:external-link}}`
    - Note that for this to work, URL encoding must be turned off

## Related plugins
- [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri): enables URIs for daily note, appending text to a file, jump to heading, search and replace, and more
- [Hotkey Helper](https://github.com/pjeby/hotkey-helper): enables Obsidian URIs for plugin READMEs, settings, and hotkey configurations

## Help
For more information on URIs in Obsidian, see the [Obsidian documentation](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI). An incomplete list of other URI schemes can be found [here](https://en.wikipedia.org/wiki/List_of_URI_schemes).

## Thanks
Parts of this code, especially the icon picker, borrow heavily from [phibr0](https://github.com/phibr0)'s plugins, including [Obsidian Macros](https://github.com/phibr0/obsidian-macros) and [Customizable Sidebar](https://github.com/phibr0/obsidian-customizable-sidebar).