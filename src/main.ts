import { Plugin } from 'obsidian';
import { URISettingTab, URIPluginSettings, DEFAULT_SETTINGS, URICommand } from './settings';

export default class URIPlugin extends Plugin {
	settings: URIPluginSettings;

	async onload() {
		console.log('Loading PLUGIN_NAME...');

		await this.loadSettings();
		this.addSettingTab(new URISettingTab(this.app, this));

		this.addCommands();
	}

	onunload() {
		console.log('Unloading PLUGIN_NAME');
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
	
			callback: () => { //remove check, I think that's okay because URIs should be valid everywhere? honestly not 100% sure what thats doing in the default plugin
				window.open(command.URI);
			}
		})
	}
	
}




