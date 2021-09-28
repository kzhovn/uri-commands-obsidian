import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import URIPlugin from './main';
import URIModal from './URIModal';

export interface URICommand {
	name: string;
	id: string;
	URITemplate: string;
    icon?: string;
}

export interface URIPluginSettings {
	URICommands: URICommand[];
}

export const DEFAULT_SETTINGS: URIPluginSettings = {
	URICommands: [],
}

//borrowed in part from phibr0's Customizable Sidebar plugin
export class URISettingTab extends PluginSettingTab {
	plugin: URIPlugin;

	constructor(app: App, plugin: URIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'URI Commands - Settings' });

        new Setting(containerEl)
            .setName("Add URI")
            .setDesc("Add a new URI to the command palette")
            .addButton((button) => {
                button.setButtonText("Add Command")
                      .onClick(() => {
                        new URIModal(this.plugin, this).open();
                    });
            });

        this.plugin.settings.URICommands.forEach(command => {
			if (command === null) { //this should *not* happen 
				this.plugin.settings.URICommands.remove(command);
				console.log("Command was null, removing.")
				return;
			}

            const setting = new Setting(containerEl)
                .setName(command.name)
				.setDesc(command.URITemplate)
                .addExtraButton(button => {
                    button.setIcon("trash")
                          .setTooltip("Remove command")
                          .onClick(async () => {
                            this.plugin.settings.URICommands.remove(command);
                            await this.plugin.saveSettings();
                            this.display();
                            new Notice("You will need to restart Obsidian for the command to disappear.")
                        })
                })
                .addExtraButton(button => {
                    button.setIcon("gear")
                          .setTooltip("Edit command")
                          .onClick(() => {
                            new URIModal(this.plugin, this, command).open()
                    })
                });
            setting.nameEl.addClass("URI-flex");
        });

	}
}
