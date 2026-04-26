import { TFile } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";

/**
 * Находит или создаёт сегодняшнюю daily note через стандартную интеграцию
 * Daily Notes / Periodic Notes.
 *
 * Если интеграция недоступна, бросаем ошибку:
 * пользователь увидит Notice на уровне вызывающего кода.
 */
export async function ensureTodayDailyNoteExists(): Promise<TFile> {
	if (!appHasDailyNotesPluginLoaded()) {
		throw new Error("Daily Notes / Periodic Notes integration is unavailable.");
	}

	const today = window.moment();

	try {
		const allDailyNotes = getAllDailyNotes();
		const existingDailyNote = getDailyNote(today, allDailyNotes);

		if (existingDailyNote instanceof TFile) {
			return existingDailyNote;
		}
	} catch (error) {
		// Некоторые реализации могут падать, если папка из настроек ещё не создана.
		// В таком случае пробуем создать сегодняшнюю заметку напрямую.
		console.warn("Daily Weight Prompt: failed to read existing daily notes, will try to create note.", error);
	}

	const createdDailyNote = await createDailyNote(today);

	if (!(createdDailyNote instanceof TFile)) {
		throw new Error("Today's daily note could not be created.");
	}

	return createdDailyNote;
}
