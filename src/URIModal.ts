import { Modal, Notice, Setting } from "obsidian";
import { IconPicker } from "./iconPicker";
import URIPlugin from "./main";
import { URISettingTab, URICommand } from "./settings";

const EMPTY_URI_COMMAND: URICommand = {
	name: "",
	id: "",
	URITemplate: "",
	icon: "",
}

export default class URIModal extends Modal {
	settingTab: URISettingTab;
	plugin: URIPlugin;
	URICommand: URICommand;
	editMode: boolean;

	constructor(plugin: URIPlugin, settingTab: URISettingTab, command = EMPTY_URI_COMMAND, editMode = false) {
		super(plugin.app);
		this.settingTab = settingTab;
		this.plugin = plugin;
		this.URICommand = command;
		this.editMode = editMode;
	}

	onOpen() {
		let {contentEl} = this;

		new Setting(contentEl)
			.setName("Command name")
			.addText((textEl) => {
				textEl.setValue(this.URICommand.name)
					.onChange((value) => {
						this.URICommand.name = value;
						this.URICommand.id = value.trim().replace(" ", "-").toLowerCase(); //https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L62
			});
		});

		new Setting(contentEl)
			.setName("URI")
			.setDesc("Accepts {{fileName}}, {{fileText}}, and {{selection}} placeholders.")
			.addText((textEl) => {
				textEl.setValue(this.URICommand.URITemplate)
				.onChange((value) => {
					this.URICommand.URITemplate = value;
			});
		});

		//heavily borrowing https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L66
		new Setting(contentEl)
			.setName("Add icon")
			.setDesc("Optional")
			.addButton(button => {

				//button appearance
				if (this.URICommand.icon) {
					button.setIcon(this.URICommand.icon);
				} else {
					button.setButtonText("Pick icon");
				}

				button.onClick(() => {
					new IconPicker(this.plugin, this.URICommand).open()
				})
			})

		//https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L132
		//what exactly does this do?
		const buttonDiv = contentEl.createDiv({ cls: "URI-flex-center" });
		const button = createEl("button", {text: "Save command"});
		buttonDiv.appendChild(button);

		button.onClickEvent( async () => {
			if (this.editMode === false) {
				this.plugin.settings.URICommands.push(this.URICommand);
				this.plugin.addURICommand(this.URICommand);
			} else {
				new Notice("You will need to restart Obsidian for the change to take effect.")
			}

			await this.plugin.saveSettings();	
			this.settingTab.display(); //refresh settings tab
			this.close();
		})
	}

	onClose() {
	 	let {contentEl} = this;
		contentEl.empty();
	}
}