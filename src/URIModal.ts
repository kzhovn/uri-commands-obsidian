import { Modal, Notice, Setting } from "obsidian";
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
				icon: "",
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
			.setDesc("Must be unique")
			.addText((textEl) => {
				textEl.setValue(this.URICommand.name)
					.onChange((value) => {
						this.URICommand.name = value;
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
					new IconPicker(this.plugin, this.URICommand, this).open()
				})
			})

		//https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L132
		//what exactly does this do?
		const buttonDiv = contentEl.createDiv({ cls: "URI-flex-center" });
		const saveButton = createEl("button", {text: "Save command"});
		buttonDiv.appendChild(saveButton);

		saveButton.onClickEvent( async () => {
			let duplicateCommand = false;
			this.URICommand.id = this.URICommand.name.trim().replace(" ", "-").toLowerCase(); //https://github.com/phibr0/obsidian-macros/blob/master/src/ui/macroModal.ts#L62

			this.plugin.settings.URICommands.forEach(command => {
				if (command.id === this.URICommand.id) {
					duplicateCommand = true; //want to just return but that closes the modal
					new Notice("A URI command with this name already exists. Please choose a new name.");
				}
			})

			if (duplicateCommand === false) {
				if (this.editMode === false) { //creating a new command
					this.plugin.settings.URICommands.push(this.URICommand);
					this.plugin.addURICommand(this.URICommand);
				} else { //editing an existing command
					new Notice("You will need to restart Obsidian for the change to take effect.")
				}
	
				await this.plugin.saveSettings();	
				this.settingTab.display(); //refresh settings tab
				this.close();
			}
		})
	}

	onClose() {
	 	let {contentEl} = this;
		contentEl.empty();
	}
}