import { Modal, Setting, moment } from "obsidian";
import { IconPicker } from "./iconPicker";
import URIPlugin from "./main";
import { URISettingTab, URICommand } from "./settings";


export default class URIModal extends Modal {
	settingTab: URISettingTab;
	plugin: URIPlugin;
	uriCommand: URICommand;
	editMode: boolean;

	constructor(plugin: URIPlugin, settingTab: URISettingTab, command: URICommand = null, editMode = false) {
		super(plugin.app);
		this.settingTab = settingTab;
		this.plugin = plugin;
		this.editMode = editMode;

		if (command === null) {
			this.uriCommand = {
				name: "",
				id: "",
				URITemplate: "",
			}
		} else {
			this.uriCommand = command; 
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
				textEl.setValue(this.uriCommand.name)
					.onChange((value) => {
						this.uriCommand.name = value;
			});
		});

		new Setting(contentEl)
			.setName("URI")
			.setDesc("Accepts {{fileName}}, {{fileText}}, {{selection}}, {{line}} and {{meta:FIELD_NAME}} placeholders.")
			.addText((textEl) => {
				textEl.setValue(this.uriCommand.URITemplate)
				.onChange((value) => {
					this.uriCommand.URITemplate = value;
			});
		});

		//heavily borrowing https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L66
		new Setting(contentEl)
			.setName("Add icon")
			.setDesc("Optional")
			.addButton(button => {
				if (this.uriCommand.icon) { //button looks like the existing icon
					button.setIcon(this.uriCommand.icon);
				} else { //or if no existing icon
					button.setButtonText("Pick icon");
				}

				button.onClick(() => {
					new IconPicker(this.plugin, this.uriCommand, this).open()
				});
			});


		//https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L132
		const buttonDiv = contentEl.createDiv({ cls: "URI-flex-center" });
		const saveButton = createEl("button", {text: "Save command"});
		buttonDiv.appendChild(saveButton);

		saveButton.onClickEvent(async () => {
			if (this.editMode === false) { //creating a new command
				//replace spaces with - and add unix millisec timestamp (to ensure uniqueness)
				this.uriCommand.id = this.uriCommand.name.trim().replace(" ", "-").toLowerCase() + moment().valueOf();
				this.plugin.settings.URICommands.push(this.uriCommand);
				this.plugin.addURICommand(this.uriCommand);
			} else { //remove and readd command, works around forcing the user to reload the entire app
				(this.app as any).commands.removeCommand(`${this.plugin.manifest.id}:${this.uriCommand.id}`);
				this.plugin.addURICommand(this.uriCommand);				
			}

			await this.plugin.saveSettings();	
			this.settingTab.display(); //refresh settings tab
			this.close();	
		});
	}

	onClose() {
	 	let {contentEl} = this;
		contentEl.empty();
	}
}