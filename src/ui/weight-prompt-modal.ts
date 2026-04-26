import { App, ButtonComponent, Modal, Setting, TextComponent } from "obsidian";
import type { Localization } from "../i18n";

interface WeightPromptModalOptions {
	propertyName: string;
	text: Localization;
	onSave: (weight: number) => Promise<boolean>;
	onSkip: () => Promise<boolean>;
}

/**
 * Simple modal for entering the current weight.
 * The extra comments here are intentional so it is easier to understand
 * how Obsidian UI is composed through its API.
 */
export class WeightPromptModal extends Modal {
	private readonly propertyName: string;
	private readonly text: Localization;
	private readonly onSaveCallback: (weight: number) => Promise<boolean>;
	private readonly onSkipCallback: () => Promise<boolean>;

	private inputComponent: TextComponent | null = null;
	private validationEl: HTMLDivElement | null = null;

	constructor(app: App, options: WeightPromptModalOptions) {
		super(app);
		this.propertyName = options.propertyName;
		this.text = options.text;
		this.onSaveCallback = options.onSave;
		this.onSkipCallback = options.onSkip;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		this.setTitle(this.text.modalTitle);

		// Small user hint:
		// explain immediately which frontmatter property will be updated.
		contentEl.createEl("p", {
			text: this.text.modalIntro(this.propertyName),
		});

		new Setting(contentEl)
			.setName(this.text.modalWeightName)
			.setDesc(this.text.modalWeightDescription)
			.addText((text) => {
				this.inputComponent = text;
				// Explicitly clear the field every time the modal opens.
				// This guarantees that the user sees an empty input.
				text.setValue("");

				// Handling Enter improves UX:
				// the user can type a number and submit immediately.
				text.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
					if (event.key === "Enter") {
						event.preventDefault();
						void this.handleSave();
					}
				});
			});

		this.validationEl = contentEl.createDiv({ cls: "daily-weight-validation-message" });

		const buttonsWrapper = contentEl.createDiv({ cls: "daily-weight-buttons" });

		const saveButton = new ButtonComponent(buttonsWrapper);
		saveButton
			.setButtonText(this.text.modalSaveButton)
			.setCta()
			.onClick(() => {
				void this.handleSave();
			});

		const skipButton = new ButtonComponent(buttonsWrapper);
		skipButton
			.setButtonText(this.text.modalSkipButton)
			.onClick(() => {
				void this.handleSkip();
			});

		// Focus the field after the modal opens
		// so the user can start typing immediately.
		window.setTimeout(() => {
			this.inputComponent?.inputEl.focus();
		}, 0);
	}

	onClose(): void {
		this.contentEl.empty();
		this.inputComponent = null;
		this.validationEl = null;
	}

	/**
	 * Handles the Save button.
	 * If the value is invalid, the modal stays open.
	 */
	private async handleSave(): Promise<void> {
		const rawValue = this.inputComponent?.getValue() ?? "";
		const parsedWeight = parseWeightInput(rawValue);

		if (parsedWeight === null) {
			this.setValidationMessage(this.text.modalValidationMessage);
			return;
		}

		this.setValidationMessage("");
		const wasSaved = await this.onSaveCallback(parsedWeight);
		if (wasSaved) {
			this.close();
		}
	}

	/**
	 * Handles the Skip button.
	 * In this case, `null` is written to frontmatter.
	 */
	private async handleSkip(): Promise<void> {
		this.setValidationMessage("");
		const wasSkipped = await this.onSkipCallback();
		if (wasSkipped) {
			this.close();
		}
	}

	private setValidationMessage(message: string): void {
		if (!this.validationEl) {
			return;
		}

		this.validationEl.setText(message);
	}
}

/**
 * Parses the user's weight input.
 *
 * Allowed:
 * - integers: 87
 * - decimal numbers with a comma: 87,4
 * - decimal numbers with a dot: 87.4
 *
 * Rejected:
 * - empty string
 * - letters
 * - units such as 87kg
 */
export function parseWeightInput(rawValue: string): number | null {
	const trimmedValue = rawValue.trim();

	if (trimmedValue.length === 0) {
		return null;
	}

	const validWeightPattern = /^\d+(?:[.,]\d+)?$/;
	if (!validWeightPattern.test(trimmedValue)) {
		return null;
	}

	const normalizedValue = trimmedValue.replace(",", ".");
	const parsedNumber = Number(normalizedValue);

	return Number.isFinite(parsedNumber) ? parsedNumber : null;
}
