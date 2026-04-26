import { describe, expect, it } from "vitest";

import { parseWeightInput } from "../src/ui/weight-prompt-modal";

describe("parseWeightInput", () => {
	it("parses integer values", () => {
		// A plain integer is the simplest supported input.
		expect(parseWeightInput("87")).toBe(87);
	});

	it("parses decimal values with a dot", () => {
		// Dot decimals are common in English locales.
		expect(parseWeightInput("87.4")).toBe(87.4);
	});

	it("parses decimal values with a comma", () => {
		// Comma decimals are common in many European locales.
		expect(parseWeightInput("87,4")).toBe(87.4);
	});

	it("ignores surrounding whitespace", () => {
		// Users often paste or type values with accidental spaces.
		expect(parseWeightInput("  87,4  ")).toBe(87.4);
	});

	it("rejects empty input", () => {
		// Empty input must keep the modal in validation mode.
		expect(parseWeightInput("")).toBeNull();
		expect(parseWeightInput("   ")).toBeNull();
	});

	it("rejects non-numeric text", () => {
		// Text or mixed values should not be silently coerced.
		expect(parseWeightInput("eighty seven")).toBeNull();
		expect(parseWeightInput("87kg")).toBeNull();
	});

	it("rejects malformed decimal values", () => {
		// The parser only supports a single decimal separator.
		expect(parseWeightInput("87,4.1")).toBeNull();
		expect(parseWeightInput("87..4")).toBeNull();
	});
});
