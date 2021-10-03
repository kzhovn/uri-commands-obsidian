import { Editor, Plugin, addIcon, Notice, TFile, MarkdownView } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';
import * as feather from "feather-icons";

const SELECTION_TEMPLATE = "{{selection}}";
const FILE_TEXT_TEMPLATE = "{{fileText}}";
const FILE_NAME_TEMPLATE = "{{fileName}}";
const LINE_TEMPLATE = "{{line}}";
const METADATA_REGEX = /{{meta:([^}]*)}}/; //note that this will *not* match if the metadata name has a } in it


export default class URIPlugin extends Plugin {
	settings: URIPluginSettings;
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
		const editorTemplates = [SELECTION_TEMPLATE, LINE_TEMPLATE];
		const uriContainsEditorTemplates = editorTemplates.some(template => command.URITemplate.includes(template)); //https://stackoverflow.com/a/66980203

		if (uriContainsEditorTemplates) { //if the placeholder used needs an editor to be valid
			this.addCommand({
				id: command.id,
				name: command.name,
				icon: command.icon,
		
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					let URIString = command.URITemplate; //needs to be set *inside* the command
					const file = view.file;

					URIString = this.replaceName(URIString, file);
					URIString = await this.replaceText(URIString, file);
					URIString = await this.replaceMeta(URIString, file);

					if (URIString === null)  { return; }

					if (URIString.includes(SELECTION_TEMPLATE)) { //current selection
						URIString = replacePlaceholder(URIString, SELECTION_TEMPLATE, editor.getSelection()); //currently replaced with empty string if no selection
					}

					if (URIString.includes(LINE_TEMPLATE)) { //current line
						const currentLine = editor.getCursor().line;
						URIString = replacePlaceholder(URIString, LINE_TEMPLATE, editor.getLine(currentLine)); 
					}					
					
					window.open(URIString);
				}
			});
		} else { //no editor required -> note that placeholders might still be invalid
			this.addCommand({
				id: command.id,
				name: command.name,
				icon: command.icon,
		
				callback: async () => {
					let URIString = command.URITemplate; //needs to be set *inside* the command
					const file = this.app.workspace.getActiveFile();

					URIString = this.replaceName(URIString, file);
					URIString = await this.replaceText(URIString, file);
					URIString = await this.replaceMeta(URIString, file);
					
					if (URIString === null) { return; }
					
					window.open(URIString);
				}
			});
		}
	}

	//return URI with the {{fileName}} placeholders replaced with the name of the file, or null if the file is null
	replaceName(URIString: string, file: TFile): string {
		if (!URIString) {
			return null;
		}

		if (URIString.includes(FILE_NAME_TEMPLATE)) { //note name (no path or extension)
			if (file) {
				return replacePlaceholder(URIString, FILE_NAME_TEMPLATE, file.basename);
			} else {
				new Notice("Must have active file to use {{fileName}} placeholder.")
				return null;
			}
		} 

		return URIString;
	}

	//returns URI with the {{fileText}} placeholders replaced with the text of the file, or null if it can't grab file text
	async replaceText(URIString: string, file: TFile): Promise<string> {
		if (!URIString) {
			return null;
		}
		
		if (URIString.includes(FILE_TEXT_TEMPLATE)) { //text of full file
			if (file && file.extension === "md") {
				const fileText = await this.app.vault.read(file);
				return replacePlaceholder(URIString, FILE_TEXT_TEMPLATE, fileText);	
			} else {
				new Notice("Must have active markdown file to use {{fileText}} placeholder.")
				return null;
			}
		}

		return URIString;
	}

	//returns a URI with the {{meta:}} placeholders replaced with their corresponding values if I can grab metadata here
	//null if it attempted an illegal operation, and the unmodified URI string if there are no {{meta:}} placeholders
	async replaceMeta(URIString: string, file: TFile): Promise<string> {
		if(METADATA_REGEX.test(URIString)) {
			//checks if you can use metadata placeholder
			//@ts-ignore
			if (!this.app.plugins.plugins["metaedit"].api) {
				new Notice("Must have MetaEdit enabled to use metadata placeholders")
				return null;
			} else if (!file) {
				new Notice("Must have active file to use {{meta:}} placeholder.");
				return null;
			} else if (!URIString) {
				return null;
			}

			//@ts-ignore
			const {getPropertyValue} = this.app.plugins.plugins["metaedit"].api;
			
			//for every instance of the placeholder: extract the name of the field, get the corresponding value, and replace the placeholder with the encoded value
			//https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
			let metadataMatch = METADATA_REGEX.exec(URIString); //grab a matched group, where match[0] is the full regex and match [1] is the (first) group
			
			while (metadataMatch !== null) { //loop through all the matched until exec() isn't spitting out any more
				let metadataValue = await getPropertyValue(metadataMatch[1], file);
				if (!metadataValue) { //if this value doesn't exist on the file
					new Notice("The field " + metadataMatch[1] + " does not exist on this file.")
					return null;
				}
				URIString = replacePlaceholder(URIString, metadataMatch[0], metadataValue);
				metadataMatch = METADATA_REGEX.exec(URIString);
			}
		}

		return URIString;
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

function replacePlaceholder(URIString: string, placeholder: string | RegExp, replacementString: string) {
	if (URIString === null) {
		return null;
	}
	
	const encodedReplacement = encodeURIComponent(replacementString);
	return URIString.replace(placeholder, encodedReplacement);
}




