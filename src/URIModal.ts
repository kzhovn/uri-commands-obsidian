import { Modal, Setting } from "obsidian";
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
	editMode: boolean = false;

	constructor(plugin: URIPlugin, settingTab: URISettingTab, command = EMPTY_URI_COMMAND) {
		super(plugin.app);
		this.settingTab = settingTab;
		this.plugin = plugin;
		this.URICommand = command;

		if (command !== EMPTY_URI_COMMAND) {
			this.editMode = true;
		}
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
		const buttonDiv = contentEl.createDiv({ cls: "M-flex-center" });
		const button = createEl("button", {text: "Save command"});
		buttonDiv.appendChild(button);

		button.onClickEvent( async () => {
			if (this.editMode === false) {
				this.plugin.settings.URICommands.push(this.URICommand);
				await this.plugin.addURICommand(this.URICommand);
			}

			await this.plugin.saveSettings();	
			this.settingTab.display(); //refresh settings tab
			this.close();
		})
	}

	async onClose() {
	 	let {contentEl} = this;
		contentEl.empty();
	}
}