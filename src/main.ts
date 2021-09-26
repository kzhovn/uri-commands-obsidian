import { App, Modal, Notice, Plugin } from 'obsidian';
import { SampleSettingTab, MyPluginSettings, DEFAULT_SETTINGS } from './settings';

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log('Loading PLUGIN_NAME...');

		await this.loadSettings();

		this.addRibbonIcon('icon', 'PLUGIN_NAME', () => {
			//do something on click
		});

		this.addCommand({
			id: 'open-sample-modal',
			name: 'Open Sample Modal',

			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						//do something
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
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
}


