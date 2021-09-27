import { Editor, Plugin } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';

const SELECTION_TEMPLATE = "{{selection}}";
const FILE_TEXT_TEMPLATE = "{{fileText}}";
const FILE_NAME_TEMPLATE = "{{fileName}}";


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

	async addCommands() {
		this.settings.URICommands.forEach(async command => {
			await this.addURICommand(command);
		})
	}

	async addURICommand(command: URICommand) {
		let URIString = command.URITemplate;

		//if needs editor
		if (URIString.includes(FILE_NAME_TEMPLATE) || URIString.includes(FILE_TEXT_TEMPLATE) || URIString.includes(SELECTION_TEMPLATE)) { //refactor this not to be terrible
			this.addCommand({
				id: command.id,
				name: command.name,
		
				editorCallback: async (editor: Editor) => { //remove check, I think that's okay because URIs should be valid everywhere? honestly not 100% sure what thats doing in the default plugin
					URIString = command.URITemplate; //needs to be set *inside* the command
					const activeFile = this.app.workspace.getActiveFile();
					console.log("Running command.")

					if (activeFile) { //is this redundant with editorCallback
						console.log(URIString);
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
					}
					
					window.open(URIString);
				}
			})	
		} else { //no editor, no placeholders
			this.addCommand({
				id: command.id,
				name: command.name,
		
				callback: async () => { //remove check, I think that's okay because URIs should be valid everywhere? honestly not 100% sure what thats doing in the default plugin
					window.open(URIString);
				}
			})
	
		}

	}
	
}




