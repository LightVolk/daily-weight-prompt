import { App, PluginSettingTab, Setting } from "obsidian";
import DailyWeightPlugin from "./main";

export interface WeightPluginSettings {
	/**
	 * Имя свойства во frontmatter.
	 * По умолчанию: weight
	 */
	weightPropertyName: string;

	/**
	 * Если true, автоматический prompt не показывается повторно в тот же день.
	 */
	askOnlyOncePerDay: boolean;

	/**
	 * Служебное состояние: дата последнего показа/обработки prompt.
	 * Формат: YYYY-MM-DD
	 */
	lastPromptDate: string;
}

export const DEFAULT_SETTINGS: WeightPluginSettings = {
	weightPropertyName: "weight",
	askOnlyOncePerDay: true,
	lastPromptDate: "",
};

export class WeightSettingTab extends PluginSettingTab {
	plugin: DailyWeightPlugin;

	constructor(app: App, plugin: DailyWeightPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Weight property name")
			.setDesc("Frontmatter property name to update in the daily note.")
			.addText((text) => {
				text
					.setPlaceholder("Weight")
					.setValue(this.plugin.settings.weightPropertyName)
					.onChange(async (value) => {
						// Убираем лишние пробелы, чтобы не получить случайно свойство
						// вроде \" weight \".
						const normalizedValue = value.trim();
						this.plugin.settings.weightPropertyName = normalizedValue || DEFAULT_SETTINGS.weightPropertyName;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Ask only once per day")
			.setDesc("Do not show the automatic weight prompt again on the same day.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.askOnlyOncePerDay)
					.onChange(async (value) => {
						this.plugin.settings.askOnlyOncePerDay = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
