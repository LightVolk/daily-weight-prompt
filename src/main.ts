import { Notice, Plugin, TFile } from "obsidian";
import { WeightPromptModal } from "./ui/weight-prompt-modal";
import { DEFAULT_SETTINGS, WeightPluginSettings, WeightSettingTab } from "./settings";
import { ensureTodayDailyNoteExists } from "./daily-note";
import { getLocalization } from "./i18n";

export default class DailyWeightPlugin extends Plugin {
	settings: WeightPluginSettings = { ...DEFAULT_SETTINGS };

	/**
	 * Main plugin entry point.
	 * This method only:
	 * 1. loads persisted settings/state;
	 * 2. registers the command;
	 * 3. adds the settings tab;
	 * 4. starts the automatic check after the Obsidian UI is fully ready.
	 */
	async onload(): Promise<void> {
		await this.loadSettings();
		const text = getLocalization();

		this.addCommand({
			id: "ask-current-weight",
			name: text.commandAskCurrentWeightNow,
			callback: async () => {
				await this.askForCurrentWeight(false);
			},
		});

		this.addSettingTab(new WeightSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			// Do not block UI startup:
			// run the async logic separately.
			void this.handleStartupPrompt();
		});
	}

	/**
	 * Automatic behavior on Obsidian startup.
	 * If the user has already seen the prompt today, do not show it again.
	 */
	private async handleStartupPrompt(): Promise<void> {
		if (this.settings.askOnlyOncePerDay && this.settings.lastPromptDate === this.getTodayDateString()) {
			return;
		}

		await this.askForCurrentWeight(true);
	}

	/**
	 * Shared method for both automatic startup and the manual command.
	 * The `respectOncePerDay` flag controls whether the
	 * "do not ask again today" guard should be enforced.
	 */
	private async askForCurrentWeight(respectOncePerDay: boolean): Promise<void> {
		const today = this.getTodayDateString();

		if (respectOncePerDay && this.settings.askOnlyOncePerDay && this.settings.lastPromptDate === today) {
			return;
		}

		const dailyNoteFile = await this.ensureTodayNoteWithErrors();
		if (!dailyNoteFile) {
			return;
		}

		const modal = new WeightPromptModal(this.app, {
			propertyName: this.settings.weightPropertyName,
			text: getLocalization(),
			onSave: async (weight: number) => {
				return await this.saveWeightToNote(dailyNoteFile, weight, today);
			},
			onSkip: async () => {
				return await this.saveWeightToNote(dailyNoteFile, null, today);
			},
		});

		modal.open();
	}

	/**
	 * Creates or finds today's daily note.
	 * All user-facing failures are converted to Notice messages so the user
	 * can understand what went wrong.
	 */
	private async ensureTodayNoteWithErrors(): Promise<TFile | null> {
		try {
			return await ensureTodayDailyNoteExists();
		} catch (error) {
			const message = error instanceof Error ? error.message : getLocalization().noticeCouldNotGetTodayDailyNote;
			new Notice(message, 6000);
			console.error("Daily Weight Prompt: failed to prepare today's daily note.", error);
			return null;
		}
	}

	/**
	 * Saves the weight to frontmatter and marks today's prompt as handled.
	 * The single source of truth for the daily value is the daily note frontmatter.
	 */
	private async saveWeightToNote(file: TFile, weight: number | null, today: string): Promise<boolean> {
		try {
			await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
				frontmatter[this.settings.weightPropertyName] = weight;
			});

			this.settings.lastPromptDate = today;
			await this.saveSettings();
			return true;
		} catch (error) {
			new Notice(getLocalization().noticeCouldNotUpdateTodayDailyNote, 6000);
			console.error("Daily Weight Prompt: failed to update frontmatter.", error);
			return false;
		}
	}

	/**
	 * Returns the date string in the required format:
	 * YYYY-MM-DD
	 */
	private getTodayDateString(): string {
		return window.moment().format("YYYY-MM-DD");
	}

	/**
	 * Loads settings and merges them with defaults.
	 * This keeps the plugin compatible when `data.json` does not yet contain
	 * newly added fields.
	 */
	async loadSettings(): Promise<void> {
		const loadedData = (await this.loadData()) as Partial<WeightPluginSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...loadedData,
		};
	}

	/**
	 * Saves both settings and internal state into one `data.json` object.
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
