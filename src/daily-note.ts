import { TFile } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";

/**
 * Finds or creates today's daily note through the standard
 * Daily Notes / Periodic Notes.
 *
 * If the integration is unavailable, throw an error.
 * The caller is responsible for converting it into a user-facing Notice.
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
		// Some implementations can fail if the configured folder does not exist yet.
		// In that case, fall back to creating today's note directly.
		console.warn("Daily Weight Prompt: failed to read existing daily notes, will try to create note.", error);
	}

	const createdDailyNote = await createDailyNote(today);

	if (!(createdDailyNote instanceof TFile)) {
		throw new Error("Today's daily note could not be created.");
	}

	return createdDailyNote;
}
