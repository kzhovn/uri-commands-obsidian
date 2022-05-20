import { Editor, Plugin, Notice, TFile, MarkdownView } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';

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
	async onload() {
		console.log('Loading URI commands...');

		await this.loadSettings();
		this.addSettingTab(new URISettingTab(this.app, this));

		this.addCommands();
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
				uriString = replacePlaceholder(command, uriString, metadataMatch[0], metadataValue);
				metadataMatch = METADATA_REGEX.exec(uriString);
			}
		}

		if (uriString.includes(FILE_NAME_TEMPLATE)) { // base name of file
			uriString = replacePlaceholder(command, uriString, FILE_NAME_TEMPLATE, file.basename);
		}

		if (uriString.includes(FILE_TEXT_TEMPLATE)) { //entire text of file
			const fileText = await this.app.vault.read(file);
			return replacePlaceholder(command, uriString, FILE_TEXT_TEMPLATE, fileText);
		}

		if (uriString.includes(SELECTION_TEMPLATE)) { //current selection
			uriString = replacePlaceholder(command, uriString, SELECTION_TEMPLATE, editor.getSelection()); //currently replaced with empty string if no selection
		}

		if (uriString.includes(LINE_TEMPLATE)) { //current line
			const currentLine = editor.getCursor().line;
			uriString = replacePlaceholder(command, uriString, LINE_TEMPLATE, editor.getLine(currentLine));
		}

		if (uriString.includes(FILE_PATH_TEMPLATE)) { //path inside the vault to the current file
			uriString = replacePlaceholder(command, uriString, FILE_PATH_TEMPLATE, file.path);
		}

		if (uriString.includes(VAULT_NAME_TEMPLATE)) { //name of the current vault
			uriString = replacePlaceholder(command, uriString, VAULT_NAME_TEMPLATE, this.app.vault.getName());
		}

		window.open(uriString);
		if (this.settings.notification === true) {
			new Notice(`Opening ${uriString}`);
		}
	}
}

function replacePlaceholder(command: URICommand, uriString: string, placeholder: string | RegExp, replacementString: string) {
	if (command.encode) {
		replacementString = encodeURIComponent(replacementString);
	}

	return uriString.replace(placeholder, replacementString);
}




