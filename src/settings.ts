import { App, PluginSettingTab, Setting } from "obsidian";
import { getLocalization } from "./i18n";
import DailyWeightPlugin from "./main";

export interface WeightPluginSettings {
	/**
	 * Frontmatter property name.
	 * Default: `weight`
	 */
	weightPropertyName: string;

	/**
	 * If true, the automatic prompt is not shown again on the same day.
	 */
	askOnlyOncePerDay: boolean;

	/**
	 * Internal state: date of the last prompt display/handling.
	 * Format: YYYY-MM-DD
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
		const localization = getLocalization();
		containerEl.empty();

		new Setting(containerEl)
			.setName(localization.settingsWeightPropertyName)
			.setDesc(localization.settingsWeightPropertyDescription)
			.addText((text) => {
				text
					.setPlaceholder(localization.settingsWeightPropertyPlaceholder)
					.setValue(this.plugin.settings.weightPropertyName)
					.onChange(async (value) => {
						// Trim extra whitespace so we do not accidentally persist
						// a property name like " weight ".
						const normalizedValue = value.trim();
						this.plugin.settings.weightPropertyName = normalizedValue || DEFAULT_SETTINGS.weightPropertyName;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(localization.settingsAskOnlyOncePerDay)
			.setDesc(localization.settingsAskOnlyOncePerDayDescription)
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
