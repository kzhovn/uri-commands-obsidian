import { Modal, Setting } from "obsidian";
import URIPlugin from "./main";
import { URISettingTab, URICommand } from "./settings";

export default class URIModal extends Modal {
	settingTab: URISettingTab;
	plugin: URIPlugin;
	newURICommand: URICommand;

	constructor(plugin: URIPlugin, settingTab: URISettingTab) {
		super(plugin.app);
		this.settingTab = settingTab;
		this.plugin = plugin;

		this.newURICommand = {
			name: "",
			id: "",
			URI: "",
		}
	}

	onOpen() {
		let {contentEl} = this;

		new Setting(contentEl)
			.setName("Command name")
			.setDesc("")
			.addText((textEl) => {
			textEl.onChange((value) => {
				this.newURICommand.name = value;
				this.newURICommand.id = value.trim().replace(" ", "-").toLowerCase(); //https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L62
			});
		});

		new Setting(contentEl)
			.setName("URI")
			.setDesc("")
			.addText((textEl) => {
			textEl.onChange((value) => {
				this.newURICommand.URI = value;
			});
		});

		//https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L132
		//what exactly does this do?
		const btnDiv = contentEl.createDiv({ cls: "M-flex-center" });
		const button = createEl("button", {text: "Save command"});
		btnDiv.appendChild(button);

		button.onClickEvent( async () => {
			this.plugin.settings.URICommands.push(this.newURICommand);
			await this.plugin.saveSettings();
			this.settingTab.display(); //refresh settings tab

			await this.plugin.addURICommand(this.newURICommand);

			this.close();
		})
		
	}

	async onClose() {
	 	let {contentEl} = this;
		contentEl.empty();
	}
}