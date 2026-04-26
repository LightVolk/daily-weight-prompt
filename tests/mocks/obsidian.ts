import { vi } from "vitest";

export const obsidianTestState = {
	notices: [] as Array<{ message: string; duration?: number }>,
	language: "en",
};

export function getLanguage(): string {
	return obsidianTestState.language;
}

export class TFile {
	path: string;
	frontmatter: Record<string, unknown>;

	constructor(path: string) {
		this.path = path;
		this.frontmatter = {};
	}
}

export class Notice {
	constructor(message: string, duration?: number) {
		obsidianTestState.notices.push({ message, duration });
	}
}

export class Plugin {
	app: unknown;

	constructor(app: unknown) {
		this.app = app;
	}

	addCommand(_command: unknown): void {
		// Tests replace this behavior inside subclasses or instances as needed.
	}

	addSettingTab(_settingTab: unknown): void {
		// Tests replace this behavior inside subclasses or instances as needed.
	}

	async loadData(): Promise<unknown> {
		return (this as { __loadedData?: unknown }).__loadedData ?? null;
	}

	async saveData(data: unknown): Promise<void> {
		(this as { __savedData?: unknown }).__savedData = data;
	}
}

export class PluginSettingTab {
	app: unknown;
	plugin: unknown;
	containerEl = { empty: vi.fn() };

	constructor(app: unknown, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
	}
}

export class Setting {
	setName(): this {
		return this;
	}

	setDesc(): this {
		return this;
	}

	addText(callback: (component: TextComponent) => void): this {
		callback(new TextComponent());
		return this;
	}

	addToggle(callback: (component: ToggleComponent) => void): this {
		callback(new ToggleComponent());
		return this;
	}
}

export class App {}

export class Modal {
	app: unknown;
	contentEl = {
		empty: () => undefined,
		createEl: () => ({})
	,
		createDiv: () => ({
			setText: () => undefined,
		}),
	};

	constructor(app: unknown) {
		this.app = app;
	}

	setTitle(_title: string): void {
		// No-op in tests.
	}

	open(): void {
		// No-op in tests.
	}

	close(): void {
		// No-op in tests.
	}
}

export class ButtonComponent {
	constructor(_containerEl: unknown) {}

	setButtonText(_text: string): this {
		return this;
	}

	setCta(): this {
		return this;
	}

	onClick(_callback: () => void): this {
		return this;
	}
}

export class TextComponent {
	inputEl = {
		addEventListener: () => undefined,
		focus: () => undefined,
	};

	private value = "";

	setPlaceholder(_placeholder: string): this {
		return this;
	}

	setValue(value: string): this {
		this.value = value;
		return this;
	}

	onChange(_callback: (value: string) => void): this {
		return this;
	}

	getValue(): string {
		return this.value;
	}
}

export class ToggleComponent {
	setValue(_value: boolean): this {
		return this;
	}

	onChange(_callback: (value: boolean) => void): this {
		return this;
	}
}
