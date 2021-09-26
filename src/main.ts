import { Plugin } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';
import * as URI from 'uri-js'

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
		this.addCommand({
			id: command.id,
			name: command.name,
	
			callback: async () => { //remove check, I think that's okay because URIs should be valid everywhere? honestly not 100% sure what thats doing in the default plugin
				let URIString = command.URITemplate
				
				if (URIString.includes(FILE_NAME_TEMPLATE)) {
					const activeFile = this.app.workspace.getActiveFile();
					if (activeFile) {
						const encodedName = encodeURIComponent(activeFile.basename);
						URIString = URIString.replace(FILE_NAME_TEMPLATE, encodedName);
					}
				}
				
				if (URIString.includes(FILE_TEXT_TEMPLATE)) {
					const activeFile = this.app.workspace.getActiveFile();
					if (activeFile) {
						const fileText = encodeURIComponent(await this.app.vault.adapter.read(activeFile.path))
						URIString = URIString.replace(FILE_TEXT_TEMPLATE, fileText);
					}
				}
				
				window.open(URIString);
			}
		})
	}
	
}




