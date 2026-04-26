import { Notice, Plugin, TFile } from "obsidian";
import { WeightPromptModal } from "./ui/weight-prompt-modal";
import { DEFAULT_SETTINGS, WeightPluginSettings, WeightSettingTab } from "./settings";
import { ensureTodayDailyNoteExists } from "./daily-note";
import { getLocalization } from "./i18n";

export default class DailyWeightPlugin extends Plugin {
	settings: WeightPluginSettings = { ...DEFAULT_SETTINGS };

	/**
	 * Основная точка входа плагина.
	 * Здесь мы только:
	 * 1. загружаем сохранённые настройки/состояние;
	 * 2. регистрируем команду;
	 * 3. добавляем вкладку настроек;
	 * 4. запускаем автопроверку после полной готовности интерфейса Obsidian.
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
			// Не блокируем загрузку интерфейса:
			// запускаем асинхронную логику отдельно.
			void this.handleStartupPrompt();
		});
	}

	/**
	 * Автоматическое поведение при старте Obsidian.
	 * Если пользователь уже видел окно сегодня, второй раз не спрашиваем.
	 */
	private async handleStartupPrompt(): Promise<void> {
		if (this.settings.askOnlyOncePerDay && this.settings.lastPromptDate === this.getTodayDateString()) {
			return;
		}

		await this.askForCurrentWeight(true);
	}

	/**
	 * Общий метод для автоматического запуска и ручной команды.
	 * Параметр `respectOncePerDay` говорит, нужно ли учитывать защиту
	 * "не спрашивать второй раз сегодня".
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
	 * Создаёт или находит сегодняшнюю daily note.
	 * Все пользовательские ошибки превращаем в Notice, чтобы пользователь понимал,
	 * что именно пошло не так.
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
	 * Сохраняем вес в frontmatter и помечаем, что сегодня окно уже было показано.
	 * Источник истины здесь только один: frontmatter daily note.
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
	 * Формируем строку даты в строго нужном формате:
	 * YYYY-MM-DD
	 */
	private getTodayDateString(): string {
		return window.moment().format("YYYY-MM-DD");
	}

	/**
	 * Загружаем и объединяем настройки с дефолтами.
	 * Так плагин не ломается, если в data.json ещё нет новых полей.
	 */
	async loadSettings(): Promise<void> {
		const loadedData = (await this.loadData()) as Partial<WeightPluginSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...loadedData,
		};
	}

	/**
	 * Сохраняем и настройки, и служебное состояние в один объект data.json.
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
