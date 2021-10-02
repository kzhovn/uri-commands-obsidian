import { Modal, Notice, Setting, moment } from "obsidian";
import { IconPicker } from "./iconPicker";
import URIPlugin from "./main";
import { URISettingTab, URICommand } from "./settings";


export default class URIModal extends Modal {
	settingTab: URISettingTab;
	plugin: URIPlugin;
	URICommand: URICommand;
	editMode: boolean;

	constructor(plugin: URIPlugin, settingTab: URISettingTab, command: URICommand = null, editMode = false) {
		super(plugin.app);
		this.settingTab = settingTab;
		this.plugin = plugin;
		this.editMode = editMode;

		if (command === null) {
			this.URICommand = {
				name: "",
				id: "",
				URITemplate: "",
			}
		} else {
			this.URICommand = command; 
		}
	}

	onOpen() {
		this.display();
	}

	display() {
		let {contentEl} = this;
		contentEl.empty();

		new Setting(contentEl)
			.setName("Command name")
			.addText((textEl) => {
				textEl.setValue(this.URICommand.name)
					.onChange((value) => {
						this.URICommand.name = value;
			});
		});

		new Setting(contentEl)
			.setName("URI")
			.setDesc("Accepts {{fileName}}, {{fileText}}, {{selection}}, {{line}} and {{meta:FIELD_NAME}} placeholders.")
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
					new IconPicker(this.plugin, this.URICommand, this).open()
				})
			})

		//borrowing from https://github.com/pjeby/hotkey-helper/blob/e394b940dfc0a98fdb4db6e586558956e03f2673/src/plugin.js#L410
		// new Setting(contentEl)
		// 	.setName("Configure hotkey")
		// 	.setDesc("Optional")
		// 	.addButton(button => {
		// 		button.setTooltip("Set hotkey")

		// 		if (this.URICommand.hotkeys) {
		// 			button.setButtonText(this.URICommand.hotkeys.toString())
		// 		} else {
		// 			button.setIcon("any-key")
		// 		}

		// 		button.onClick(() => {
		// 			this.close();
		// 			this.plugin.app.setting.openTabById("hotkeys");
		// 			let searchTab = this.plugin.app.setting.activeTab;
		// 			searchTab.searchInputEl.value = this.URICommand.name;
					
		// 			searchTab.onClose({this.open());

		// 		})
		// 	})



		//https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L132
		const buttonDiv = contentEl.createDiv({ cls: "URI-flex-center" });
		const saveButton = createEl("button", {text: "Save command"});
		buttonDiv.appendChild(saveButton);

		saveButton.onClickEvent( async () => {
			//replace spaces with - and add unix millisec timestamp (to ensure uniqueness)
			this.URICommand.id = this.URICommand.name.trim().replace(" ", "-").toLowerCase() + moment().valueOf();

			if (this.editMode === false) { //creating a new command
				this.plugin.settings.URICommands.push(this.URICommand);
				this.plugin.addURICommand(this.URICommand);
			} else { //editing an existing command
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