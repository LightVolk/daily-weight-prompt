import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dailyNoteMocks = vi.hoisted(() => ({
	appHasDailyNotesPluginLoaded: vi.fn(),
	getAllDailyNotes: vi.fn(),
	getDailyNote: vi.fn(),
	createDailyNote: vi.fn(),
}));

vi.mock("obsidian-daily-notes-interface", () => dailyNoteMocks);

import { TFile } from "obsidian";
import { ensureTodayDailyNoteExists } from "../src/daily-note";

describe("ensureTodayDailyNoteExists", () => {
	beforeEach(() => {
		// Each test sets up its own integration behavior explicitly.
		dailyNoteMocks.appHasDailyNotesPluginLoaded.mockReset();
		dailyNoteMocks.getAllDailyNotes.mockReset();
		dailyNoteMocks.getDailyNote.mockReset();
		dailyNoteMocks.createDailyNote.mockReset();

		(globalThis as typeof globalThis & { window: { moment: () => object } }).window = {
			moment: () => ({ fake: "today" }),
		};

		// The fallback test intentionally triggers a warning path,
		// so we silence console noise and keep the test output readable.
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("throws when Daily Notes integration is unavailable", async () => {
		// Without the integration the plugin cannot resolve the target note.
		dailyNoteMocks.appHasDailyNotesPluginLoaded.mockReturnValue(false);

		await expect(ensureTodayDailyNoteExists()).rejects.toThrow(
			"Daily Notes / Periodic Notes integration is unavailable.",
		);
	});

	it("returns the existing daily note when it is already present", async () => {
		// The happy path should avoid creating duplicate daily notes.
		const existingFile = new TFile("Daily/2026-04-26.md");

		dailyNoteMocks.appHasDailyNotesPluginLoaded.mockReturnValue(true);
		dailyNoteMocks.getAllDailyNotes.mockReturnValue({ any: "map" });
		dailyNoteMocks.getDailyNote.mockReturnValue(existingFile);

		await expect(ensureTodayDailyNoteExists()).resolves.toBe(existingFile);
		expect(dailyNoteMocks.createDailyNote).not.toHaveBeenCalled();
	});

	it("creates today's note when lookup fails", async () => {
		// Some Daily Notes setups can throw during lookup, so the plugin
		// should recover by attempting direct note creation.
		const createdFile = new TFile("Daily/2026-04-26.md");

		dailyNoteMocks.appHasDailyNotesPluginLoaded.mockReturnValue(true);
		dailyNoteMocks.getAllDailyNotes.mockImplementation(() => {
			throw new Error("Folder is missing");
		});
		dailyNoteMocks.createDailyNote.mockResolvedValue(createdFile);

		await expect(ensureTodayDailyNoteExists()).resolves.toBe(createdFile);
		expect(dailyNoteMocks.createDailyNote).toHaveBeenCalledTimes(1);
	});

	it("creates today's note when no existing note is found", async () => {
		// If lookup succeeds but returns nothing, creation is still required.
		const createdFile = new TFile("Daily/2026-04-26.md");

		dailyNoteMocks.appHasDailyNotesPluginLoaded.mockReturnValue(true);
		dailyNoteMocks.getAllDailyNotes.mockReturnValue({});
		dailyNoteMocks.getDailyNote.mockReturnValue(null);
		dailyNoteMocks.createDailyNote.mockResolvedValue(createdFile);

		await expect(ensureTodayDailyNoteExists()).resolves.toBe(createdFile);
		expect(dailyNoteMocks.createDailyNote).toHaveBeenCalledTimes(1);
	});

	it("throws when note creation does not return a file", async () => {
		// This guards against broken integrations returning an unexpected value.
		dailyNoteMocks.appHasDailyNotesPluginLoaded.mockReturnValue(true);
		dailyNoteMocks.getAllDailyNotes.mockReturnValue({});
		dailyNoteMocks.getDailyNote.mockReturnValue(null);
		dailyNoteMocks.createDailyNote.mockResolvedValue(undefined);

		await expect(ensureTodayDailyNoteExists()).rejects.toThrow(
			"Today's daily note could not be created.",
		);
	});
});
