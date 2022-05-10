import { Editor, Plugin, addIcon, Notice, TFile, MarkdownView } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';
import * as feather from "feather-icons";

const SELECTION_TEMPLATE = "{{selection}}";
const FILE_TEXT_TEMPLATE = "{{fileText}}";
const FILE_NAME_TEMPLATE = "{{fileName}}";
const LINE_TEMPLATE = "{{line}}";
const FILE_PATH_TEMPLATE = "{{filePath}}"
const VAULT_NAME_TEMPLATE = "{{vaultName}}"
const METADATA_REGEX = /{{meta:([^}]*)}}/; //note that this will *not* match if the metadata name has a } in it

const editorTemplates = [SELECTION_TEMPLATE, LINE_TEMPLATE];  // templates that require an editor to extract
const fileTemplates = [FILE_NAME_TEMPLATE, FILE_TEXT_TEMPLATE, FILE_PATH_TEMPLATE]; // templates that require an active file (but not an editor)

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
		this.addCommand({
			id: command.id,
			name: command.name,
			icon: command.icon,

			checkCallback: (check: boolean) => {
				const view: MarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				const file: TFile = this.app.workspace.getActiveFile();
				const editor: Editor = view?.editor;
				if (!editor) { //don't show commands that require an editor
					const uriContainsEditorTemplates = editorTemplates.some(template => command.URITemplate.includes(template)); //https://stackoverflow.com/a/66980203
					if (uriContainsEditorTemplates) return false;
				}

				if (!file) { // don't show commands that require a file
					const uriContainsFileTemplates = fileTemplates.some(template => command.URITemplate.includes(template));
					if (uriContainsFileTemplates || METADATA_REGEX.test(command.URITemplate)) return false;
				} else if (file.extension !== "md") { // don't show commands that require a markdown file
					if (command.URITemplate.includes(FILE_TEXT_TEMPLATE)) return false;
				}

				if (!check) this.runCommand(command, editor, file);
				return true;
			}
		});
	}

	async runCommand(command: URICommand, editor?: Editor, file?: TFile) {
		let uriString = command.URITemplate;

		if(METADATA_REGEX.test(uriString)) { //specified metadata values
			//checks if you can use metadata placeholder
			if (!(this.app as any).plugins.plugins["metaedit"].api) {
				new Notice("Must have MetaEdit enabled to use metadata placeholders")
				return;
			}

			//@ts-ignore
			const {getPropertyValue} = this.app.plugins.plugins["metaedit"].api;

			//for every instance of the placeholder: extract the name of the field, get the corresponding value, and replace the placeholder with the encoded value
			//https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
			let metadataMatch = METADATA_REGEX.exec(uriString); //grab a matched group, where match[0] is the full regex and match [1] is the (first) group

			while (metadataMatch !== null) { //loop through all the matched until exec() isn't spitting out any more
				let metadataValue = await getPropertyValue(metadataMatch[1], file);
				if (!metadataValue) { //if this value doesn't exist on the file
					new Notice(`The field ${metadataMatch[1]} does not exist on this file.`)
					return;
				}
				uriString = replacePlaceholder(uriString, metadataMatch[0], metadataValue);
				metadataMatch = METADATA_REGEX.exec(uriString);
			}
		}

		if (uriString.includes(FILE_NAME_TEMPLATE)) { // base name of file
			uriString = replacePlaceholder(uriString, FILE_NAME_TEMPLATE, file.basename);
		}

		if (uriString.includes(FILE_TEXT_TEMPLATE)) { //entire text of file
			const fileText = await this.app.vault.read(file);
			return replacePlaceholder(uriString, FILE_TEXT_TEMPLATE, fileText);
		}

		if (uriString.includes(SELECTION_TEMPLATE)) { //current selection
			uriString = replacePlaceholder(uriString, SELECTION_TEMPLATE, editor.getSelection()); //currently replaced with empty string if no selection
		}

		if (uriString.includes(LINE_TEMPLATE)) { //current line
			const currentLine = editor.getCursor().line;
			uriString = replacePlaceholder(uriString, LINE_TEMPLATE, editor.getLine(currentLine));
		}

		if (uriString.includes(FILE_PATH_TEMPLATE)) { //path inside the vault to the current file
			uriString = replacePlaceholder(uriString, FILE_PATH_TEMPLATE, file.path);
		}

		if (uriString.includes(VAULT_NAME_TEMPLATE)) { //name of the current vault
			uriString = replacePlaceholder(uriString, VAULT_NAME_TEMPLATE, this.app.vault.getName());
		}

		window.open(uriString);
		if (this.settings.notification === true) {
			new Notice(`Opening ${uriString}`);
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

function replacePlaceholder(uriString: string, placeholder: string | RegExp, replacementString: string) {
	const encodedReplacement = encodeURIComponent(replacementString);
	return uriString.replace(placeholder, encodedReplacement);
}




