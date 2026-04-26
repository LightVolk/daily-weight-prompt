import { App, ButtonComponent, Modal, Setting, TextComponent } from "obsidian";

interface WeightPromptModalOptions {
	propertyName: string;
	onSave: (weight: number) => Promise<boolean>;
	onSkip: () => Promise<boolean>;
}

/**
 * Простая модалка для ввода текущего веса.
 * Здесь сознательно много комментариев, чтобы было легче разобраться,
 * как в Obsidian строится UI через API.
 */
export class WeightPromptModal extends Modal {
	private readonly propertyName: string;
	private readonly onSaveCallback: (weight: number) => Promise<boolean>;
	private readonly onSkipCallback: () => Promise<boolean>;

	private inputComponent: TextComponent | null = null;
	private validationEl: HTMLDivElement | null = null;

	constructor(app: App, options: WeightPromptModalOptions) {
		super(app);
		this.propertyName = options.propertyName;
		this.onSaveCallback = options.onSave;
		this.onSkipCallback = options.onSkip;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		this.setTitle("Ваш текущий вес");

		// Небольшая подсказка пользователю:
		// сразу говорим, какое frontmatter-свойство будет обновлено.
		contentEl.createEl("p", {
			text: `Значение будет сохранено в frontmatter как "${this.propertyName}".`,
		});

		new Setting(contentEl)
			.setName("Вес")
			.setDesc("Введите число, например: 87,4 или 87.4")
			.addText((text) => {
				this.inputComponent = text;
				// Явно очищаем поле при каждом открытии модалки.
				// Это гарантирует, что пользователь увидит пустой ввод.
				text.setValue("");

				// Обработчик Enter делает UX быстрее:
				// пользователь может просто ввести число и нажать Enter.
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
			.setButtonText("Сохранить")
			.setCta()
			.onClick(() => {
				void this.handleSave();
			});

		const skipButton = new ButtonComponent(buttonsWrapper);
		skipButton
			.setButtonText("Пропустить")
			.onClick(() => {
				void this.handleSkip();
			});

		// Ставим фокус в поле после открытия окна,
		// чтобы можно было сразу печатать.
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
	 * Обработка кнопки "Сохранить".
	 * Если значение невалидно, окно остаётся открытым.
	 */
	private async handleSave(): Promise<void> {
		const rawValue = this.inputComponent?.getValue() ?? "";
		const parsedWeight = parseWeightInput(rawValue);

		if (parsedWeight === null) {
			this.setValidationMessage("Введите корректный вес. Примеры: 87, 87,4, 87.4");
			return;
		}

		this.setValidationMessage("");
		const wasSaved = await this.onSaveCallback(parsedWeight);
		if (wasSaved) {
			this.close();
		}
	}

	/**
	 * Обработка кнопки "Пропустить".
	 * В этом случае в frontmatter будет записано null.
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
 * Разбор пользовательского ввода веса.
 *
 * Допускаем:
 * - целые числа: 87
 * - дробные с запятой: 87,4
 * - дробные с точкой: 87.4
 *
 * Не допускаем:
 * - пустую строку
 * - буквы
 * - единицы измерения вроде 87kg
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
