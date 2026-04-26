import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { obsidianTestState, TFile } from "./mocks/obsidian";

const TODAY = "2026-04-26";

const pluginTestState = vi.hoisted(() => ({
	commands: [] as Array<{ id: string; name: string; callback: () => Promise<void> | void }>,
	settingTabs: [] as unknown[],
	layoutReadyCallback: null as (() => void) | null,
	lastModalOptions: null as
		| {
				propertyName: string;
				onSave: (weight: number) => Promise<boolean>;
				onSkip: () => Promise<boolean>;
		  }
		| null,
	modalOpenCount: 0,
	ensureTodayDailyNoteExists: vi.fn(),
}));

vi.mock("../src/ui/weight-prompt-modal", () => ({
	WeightPromptModal: class {
		constructor(_app: unknown, options: typeof pluginTestState.lastModalOptions) {
			pluginTestState.lastModalOptions = options;
		}

		open(): void {
			// Counting modal openings lets the tests assert whether prompting happened.
			pluginTestState.modalOpenCount += 1;
		}
	},
}));

vi.mock("../src/daily-note", () => ({
	ensureTodayDailyNoteExists: pluginTestState.ensureTodayDailyNoteExists,
}));

import DailyWeightPlugin from "../src/main";

function createMockApp(processFrontMatterImpl?: (file: TFile, updater: (frontmatter: Record<string, unknown>) => void) => Promise<void>) {
	return {
		workspace: {
			onLayoutReady: (callback: () => void) => {
				pluginTestState.layoutReadyCallback = callback;
			},
		},
		fileManager: {
			processFrontMatter:
				processFrontMatterImpl ??
				(async (file: TFile, updater: (frontmatter: Record<string, unknown>) => void) => {
					// This simulates Obsidian mutating the note frontmatter in place.
					updater(file.frontmatter);
				}),
		},
	};
}

function createPlugin(app = createMockApp()): DailyWeightPlugin {
	const plugin = new DailyWeightPlugin(app as never);

	// We override these methods on the instance so the tests can observe
	// what the plugin registers during onload.
	plugin.addCommand = (command) => {
		pluginTestState.commands.push(command);
	};
	plugin.addSettingTab = (settingTab) => {
		pluginTestState.settingTabs.push(settingTab);
	};

	return plugin;
}

async function flushAsyncWork(): Promise<void> {
	// Startup prompting is kicked off asynchronously from onLayoutReady,
	// so the tests wait one microtask to observe the resulting side effects.
	await Promise.resolve();
}

describe("DailyWeightPlugin", () => {
	beforeEach(() => {
		obsidianTestState.notices.length = 0;
		obsidianTestState.language = "en";
		pluginTestState.commands.length = 0;
		pluginTestState.settingTabs.length = 0;
		pluginTestState.layoutReadyCallback = null;
		pluginTestState.lastModalOptions = null;
		pluginTestState.modalOpenCount = 0;
		pluginTestState.ensureTodayDailyNoteExists.mockReset();

		(globalThis as typeof globalThis & { window: { moment: () => { format: () => string } } }).window = {
			moment: () => ({
				format: () => TODAY,
			}),
		};

		// Error paths are covered explicitly in tests, so console output
		// would only add noise without adding signal.
		vi.spyOn(console, "error").mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("registers the command and settings tab during onload", async () => {
		// This verifies the plugin exposes its public entry points to Obsidian.
		const plugin = createPlugin();

		await plugin.onload();

		expect(pluginTestState.commands).toHaveLength(1);
		expect(pluginTestState.commands[0]?.id).toBe("ask-current-weight");
		expect(pluginTestState.commands[0]?.name).toBe("Ask current weight now");
		expect(pluginTestState.settingTabs).toHaveLength(1);
		expect(pluginTestState.layoutReadyCallback).not.toBeNull();
	});

	it("registers Russian command text when Obsidian uses Russian", async () => {
		// Command labels should follow the current app language as well.
		obsidianTestState.language = "ru";
		const plugin = createPlugin();

		await plugin.onload();

		expect(pluginTestState.commands[0]?.name).toBe("Запросить текущий вес сейчас");
	});

	it("does not show the automatic prompt twice on the same day", async () => {
		// Startup prompting should respect the once-per-day protection.
		const plugin = createPlugin();
		(plugin as DailyWeightPlugin & { __loadedData: unknown }).__loadedData = {
			askOnlyOncePerDay: true,
			lastPromptDate: TODAY,
		};

		await plugin.onload();
		pluginTestState.layoutReadyCallback?.();
		await flushAsyncWork();

		expect(pluginTestState.ensureTodayDailyNoteExists).not.toHaveBeenCalled();
		expect(pluginTestState.modalOpenCount).toBe(0);
	});

	it("shows the startup prompt when the user was not prompted today", async () => {
		// This is the main automatic flow of the plugin.
		const plugin = createPlugin();
		const dailyNoteFile = new TFile("Daily/2026-04-26.md");

		pluginTestState.ensureTodayDailyNoteExists.mockResolvedValue(dailyNoteFile);

		await plugin.onload();
		pluginTestState.layoutReadyCallback?.();
		await vi.waitFor(() => {
			expect(pluginTestState.modalOpenCount).toBe(1);
		});

		expect(pluginTestState.ensureTodayDailyNoteExists).toHaveBeenCalledTimes(1);
		expect(pluginTestState.lastModalOptions?.propertyName).toBe("weight");
	});

	it("lets the manual command open the prompt even after today's startup prompt was already handled", async () => {
		// Manual invocation should bypass the once-per-day startup guard.
		const plugin = createPlugin();
		const dailyNoteFile = new TFile("Daily/2026-04-26.md");

		(plugin as DailyWeightPlugin & { __loadedData: unknown }).__loadedData = {
			askOnlyOncePerDay: true,
			lastPromptDate: TODAY,
		};
		pluginTestState.ensureTodayDailyNoteExists.mockResolvedValue(dailyNoteFile);

		await plugin.onload();
		await pluginTestState.commands[0]?.callback();

		expect(pluginTestState.ensureTodayDailyNoteExists).toHaveBeenCalledTimes(1);
		expect(pluginTestState.modalOpenCount).toBe(1);
	});

	it("saves the entered weight into frontmatter and updates plugin state", async () => {
		// This verifies the success path behind the modal save button.
		const app = createMockApp();
		const plugin = createPlugin(app);
		const dailyNoteFile = new TFile("Daily/2026-04-26.md");

		pluginTestState.ensureTodayDailyNoteExists.mockResolvedValue(dailyNoteFile);

		await plugin.onload();
		await pluginTestState.commands[0]?.callback();

		const wasSaved = await pluginTestState.lastModalOptions?.onSave(87.4);

		expect(wasSaved).toBe(true);
		expect(dailyNoteFile.frontmatter.weight).toBe(87.4);
		expect(plugin.settings.lastPromptDate).toBe(TODAY);
		expect((plugin as DailyWeightPlugin & { __savedData: DailyWeightPlugin["settings"] }).__savedData).toEqual(
			plugin.settings,
		);
	});

	it("stores null when the user skips the prompt", async () => {
		// Skip is a real state transition, not just a dismissed modal.
		const plugin = createPlugin();
		const dailyNoteFile = new TFile("Daily/2026-04-26.md");

		pluginTestState.ensureTodayDailyNoteExists.mockResolvedValue(dailyNoteFile);

		await plugin.onload();
		await pluginTestState.commands[0]?.callback();

		const wasSkipped = await pluginTestState.lastModalOptions?.onSkip();

		expect(wasSkipped).toBe(true);
		expect(dailyNoteFile.frontmatter.weight).toBeNull();
		expect(plugin.settings.lastPromptDate).toBe(TODAY);
	});

	it("shows a notice when today's daily note cannot be prepared", async () => {
		// User-facing failures should be surfaced clearly and should not open a modal.
		const plugin = createPlugin();

		pluginTestState.ensureTodayDailyNoteExists.mockRejectedValue(new Error("Daily note is missing"));

		await plugin.onload();
		await pluginTestState.commands[0]?.callback();

		expect(pluginTestState.modalOpenCount).toBe(0);
		expect(obsidianTestState.notices).toContainEqual({
			message: "Daily note is missing",
			duration: 6000,
		});
	});

	it("keeps the modal flow open when frontmatter update fails", async () => {
		// Returning false from the save callback tells the modal not to close.
		const app = createMockApp(async () => {
			throw new Error("Cannot write frontmatter");
		});
		const plugin = createPlugin(app);
		const dailyNoteFile = new TFile("Daily/2026-04-26.md");

		pluginTestState.ensureTodayDailyNoteExists.mockResolvedValue(dailyNoteFile);

		await plugin.onload();
		await pluginTestState.commands[0]?.callback();

		const wasSaved = await pluginTestState.lastModalOptions?.onSave(87.4);

		expect(wasSaved).toBe(false);
		expect(obsidianTestState.notices).toContainEqual({
			message: "Could not update today's daily note frontmatter.",
			duration: 6000,
		});
	});

	it("shows Russian error notice when Obsidian uses Russian", async () => {
		// Error messages should follow the same locale rules as the rest of the UI.
		obsidianTestState.language = "ru";
		const app = createMockApp(async () => {
			throw new Error("Cannot write frontmatter");
		});
		const plugin = createPlugin(app);
		const dailyNoteFile = new TFile("Daily/2026-04-26.md");

		pluginTestState.ensureTodayDailyNoteExists.mockResolvedValue(dailyNoteFile);

		await plugin.onload();
		await pluginTestState.commands[0]?.callback();
		await pluginTestState.lastModalOptions?.onSave(87.4);

		expect(obsidianTestState.notices).toContainEqual({
			message: "Не удалось обновить frontmatter сегодняшней заметки.",
			duration: 6000,
		});
	});
});
