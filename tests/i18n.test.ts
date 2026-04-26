import { beforeEach, describe, expect, it } from "vitest";
import { obsidianTestState } from "./mocks/obsidian";
import { getCurrentLocale, getLocalization } from "../src/i18n";

describe("i18n", () => {
	beforeEach(() => {
		// Each test sets the mocked Obsidian UI language explicitly.
		obsidianTestState.language = "en";
	});

	it("uses Russian localization when Obsidian language is ru", () => {
		// The plugin should follow the app language instead of OS locale guesses.
		obsidianTestState.language = "ru";

		expect(getCurrentLocale()).toBe("ru");
		expect(getLocalization().modalTitle).toBe("Ваш текущий вес");
	});

	it("uses Russian localization for region-specific Russian locales", () => {
		// Obsidian can report ISO locale variants, so ru-RU should still map to ru.
		obsidianTestState.language = "ru-RU";

		expect(getCurrentLocale()).toBe("ru");
	});

	it("falls back to English for non-Russian locales", () => {
		// English is the safe default for every unsupported language.
		obsidianTestState.language = "de";

		expect(getCurrentLocale()).toBe("en");
		expect(getLocalization().modalTitle).toBe("Your current weight");
	});
});
