import { Editor, Plugin, addIcon, Notice } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';
import * as feather from "feather-icons";

const SELECTION_TEMPLATE = "{{selection}}";
const FILE_TEXT_TEMPLATE = "{{fileText}}";
const FILE_NAME_TEMPLATE = "{{fileName}}";
const METADATA_REGEX = /{{meta:([^}]*)}}/ //note that this will *not* match if the metadata name has a } in it


export default class URIPlugin extends Plugin {
	settings: URIPluginSettings;
	//icon list of native obsidian icons
	iconList: string[] = ["any-key", "audio-file", "blocks", "bold-glyph", "bracket-glyph", "broken-link", "bullet-list", "bullet-list-glyph", "calendar-with-checkmark", "check-in-circle", "check-small", "checkbox-glyph", "checkmark", "clock", "cloud", "code-glyph", "create-new", "cross", "cross-in-box", "crossed-star", "csv", "deleteColumn", "deleteRow", "dice", "document", "documents", "dot-network", "double-down-arrow-glyph", "double-up-arrow-glyph", "down-arrow-with-tail", "down-chevron-glyph", "enter", "exit-fullscreen", "expand-vertically", "filled-pin", "folder", "formula", "forward-arrow", "fullscreen", "gear", "go-to-file", "hashtag", "heading-glyph", "help", "highlight-glyph", "horizontal-split", "image-file", "image-glyph", "indent-glyph", "info", "insertColumn", "insertRow", "install", "italic-glyph", "keyboard-glyph", "languages", "left-arrow", "left-arrow-with-tail", "left-chevron-glyph", "lines-of-text", "link", "link-glyph", "logo-crystal", "magnifying-glass", "microphone", "microphone-filled", "minus-with-circle", "moveColumnLeft", "moveColumnRight", "moveRowDown", "moveRowUp", "note-glyph", "number-list-glyph", "open-vault", "pane-layout", "paper-plane", "paused", "pdf-file", "pencil", "percent-sign-glyph", "pin", "plus-with-circle", "popup-open", "presentation", "price-tag-glyph", "quote-glyph", "redo-glyph", "reset", "right-arrow", "right-arrow-with-tail", "right-chevron-glyph", "right-triangle", "run-command", "search", "sheets-in-box", "sortAsc", "sortDesc", "spreadsheet", "stacked-levels", "star", "star-list", "strikethrough-glyph", "switch", "sync", "sync-small", "tag-glyph", "three-horizontal-bars", "trash", "undo-glyph", "unindent-glyph", "up-and-down-arrows", "up-arrow-with-tail", "up-chevron-glyph", "uppercase-lowercase-a", "vault", "vertical-split", "vertical-three-dots", "wrench-screwdriver-glyph"];

	async onload() {
		console.log('Loading URI commands...');

		await this.loadSettings();
		this.addSettingTab(new URISettingTab(this.app, this));

		this.addCommands();
		this.addFeatherIcons();
	}

	onunload() {
		console.log('Unloading URI commands');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	addCommands() {
		this.settings.URICommands.forEach(command => {
			this.addURICommand(command);
		})
	}

	addURICommand(command: URICommand) {
		let URIString = command.URITemplate;

		//if needs editor
		if (URIString.includes(FILE_NAME_TEMPLATE) || URIString.includes(FILE_TEXT_TEMPLATE) || URIString.includes(SELECTION_TEMPLATE) || METADATA_REGEX.test(URIString)) { //refactor this not to be terrible
			this.addCommand({
				id: command.id,
				name: command.name,
				icon: command.icon,
		
				editorCallback: async (editor: Editor) => {
					URIString = command.URITemplate; //needs to be set *inside* the command
					const activeFile = this.app.workspace.getActiveFile();

					if (activeFile) { //is this redundant with editorCallback?
						if (URIString.includes(FILE_NAME_TEMPLATE)) {
							const encodedName = encodeURIComponent(activeFile.basename);
							URIString = URIString.replace(FILE_NAME_TEMPLATE, encodedName);
						}
					
						if (URIString.includes(FILE_TEXT_TEMPLATE)) {
							const encodedFileText = encodeURIComponent(await this.app.vault.adapter.read(activeFile.path))
							URIString = URIString.replace(FILE_TEXT_TEMPLATE, encodedFileText);
						}

						if (URIString.includes(SELECTION_TEMPLATE)) {
							const encodedSelection = encodeURIComponent(editor.getSelection()); //currently replaced with empty string if no selection
							URIString = URIString.replace(SELECTION_TEMPLATE, encodedSelection);
						}

						if (METADATA_REGEX.test(URIString)) {
							//@ts-ignore
							if(this.app.plugins.plugins["metaedit"].api) {
								//@ts-ignore
								const {getPropertyValue} = this.app.plugins.plugins["metaedit"].api;
								//for every instance of the placeholder: extract the name of the field, get the corresponding value, and replace the placeholder with the encoded value

								//https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
								let metadataMatch = METADATA_REGEX.exec(URIString); //grab a matched group, where match[0] is the full regex and match [1] is the (first) group
								while (metadataMatch !== null) {
									let metadataValue = await getPropertyValue(metadataMatch[1], activeFile);
									if (!metadataValue) { //want the "if undefined or null or empty string or etc" behavior
										metadataValue = ""; //if this value doesn't exist on the file, replace placeholder with empty string
									}
									const encodedValue = encodeURIComponent(metadataValue);
									URIString = URIString.replace(metadataMatch[0], encodedValue); //does this break when there are multiple instances of the same key placeholder?
									metadataMatch = METADATA_REGEX.exec(URIString);
								}
							} else {
								new Notice("Must have MetaEdit enabled to use metadata placeholders")
							}
						}
					}
					
					window.open(URIString);
				}
			})	
		} else { //no editor, no placeholders
			this.addCommand({
				id: command.id,
				name: command.name,
				icon: command.icon,
		
				callback: () => { //remove check, I think that's okay because URIs should be valid everywhere? honestly not 100% sure what thats doing in the default plugin
					window.open(URIString);
				}
			})
		}
	}

	//from phibr0
	private addFeatherIcons() {
		Object.values(feather.icons).forEach((icon) => {
			const svg = icon.toSvg({viewBox: "0 0 24 24", width: "100", height: "100"});
			addIcon("feather-" + icon.name, svg);
			this.iconList.push("feather-" + icon.name);
		});
	}
	
}




