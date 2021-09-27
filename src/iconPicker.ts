//From https://github.com/phibr0/obsidian-macros/blob/a56fb9a7259564a9345e0d1ed0af4331f4dba104/src/ui/iconPicker.ts#L4

import { FuzzyMatch, FuzzySuggestModal, setIcon, addIcon } from "obsidian";
import URIPlugin from "src/main";
import { URICommand } from "./settings";

export class IconPicker extends FuzzySuggestModal<string>{
    plugin: URIPlugin;
    command: URICommand;

    constructor(plugin: URIPlugin, command: URICommand) {
        super(plugin.app);
        this.plugin = plugin;
        this.command = command;
        this.setPlaceholder("Pick an Icon");
    }

    private cap(string: string): string {
        const words = string.split(" ");

        return words.map((word) => {
            return word[0].toUpperCase() + word.substring(1);
        }).join(" ");
    }

    getItems(): string[] {
        return this.plugin.iconList;
    }

    getItemText(item: string): string {
        return this.cap(item.replace("feather-", "").replace(/-/ig, " "));
    }

    renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
        el.addClass("M-icon-container");
        const div = createDiv({ cls: "M-icon" });
        el.appendChild(div);
        setIcon(div, item.item);
        super.renderSuggestion(item, el);
    }

    async onChooseItem(item: string): Promise<void> {
        this.command.icon = item;
        this.close();
        
    }

}
