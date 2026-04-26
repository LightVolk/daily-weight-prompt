import { getLanguage } from "obsidian";

type SupportedLocale = "en" | "ru";

export interface Localization {
	commandAskCurrentWeightNow: string;
	modalTitle: string;
	modalIntro: (propertyName: string) => string;
	modalWeightName: string;
	modalWeightDescription: string;
	modalSaveButton: string;
	modalSkipButton: string;
	modalValidationMessage: string;
	settingsWeightPropertyName: string;
	settingsWeightPropertyDescription: string;
	settingsWeightPropertyPlaceholder: string;
	settingsAskOnlyOncePerDay: string;
	settingsAskOnlyOncePerDayDescription: string;
	noticeCouldNotGetTodayDailyNote: string;
	noticeCouldNotUpdateTodayDailyNote: string;
}

const LOCALIZATIONS: Record<SupportedLocale, Localization> = {
	en: {
		commandAskCurrentWeightNow: "Ask current weight now",
		modalTitle: "Your current weight",
		modalIntro: (propertyName) => `The value will be saved to frontmatter as "${propertyName}".`,
		modalWeightName: "Weight",
		modalWeightDescription: "Enter a number, for example: 87,4 or 87.4",
		modalSaveButton: "Save",
		modalSkipButton: "Skip",
		modalValidationMessage: "Enter a valid weight. Examples: 87, 87,4, 87.4",
		settingsWeightPropertyName: "Weight property name",
		settingsWeightPropertyDescription: "Frontmatter property name to update in the daily note.",
		settingsWeightPropertyPlaceholder: "Weight",
		settingsAskOnlyOncePerDay: "Ask only once per day",
		settingsAskOnlyOncePerDayDescription: "Do not show the automatic weight prompt again on the same day.",
		noticeCouldNotGetTodayDailyNote: "Could not get today's daily note.",
		noticeCouldNotUpdateTodayDailyNote: "Could not update today's daily note frontmatter.",
	},
	ru: {
		commandAskCurrentWeightNow: "Запросить текущий вес сейчас",
		modalTitle: "Ваш текущий вес",
		modalIntro: (propertyName) => `Значение будет сохранено в frontmatter как "${propertyName}".`,
		modalWeightName: "Вес",
		modalWeightDescription: "Введите число, например: 87,4 или 87.4",
		modalSaveButton: "Сохранить",
		modalSkipButton: "Пропустить",
		modalValidationMessage: "Введите корректный вес. Примеры: 87, 87,4, 87.4",
		settingsWeightPropertyName: "Имя свойства веса",
		settingsWeightPropertyDescription: "Имя свойства frontmatter, которое будет обновлено в ежедневной заметке.",
		settingsWeightPropertyPlaceholder: "Вес",
		settingsAskOnlyOncePerDay: "Спрашивать только раз в день",
		settingsAskOnlyOncePerDayDescription: "Не показывать автоматический запрос веса повторно в тот же день.",
		noticeCouldNotGetTodayDailyNote: "Не удалось получить сегодняшнюю daily note.",
		noticeCouldNotUpdateTodayDailyNote: "Не удалось обновить frontmatter сегодняшней заметки.",
	},
};

/**
 * Obsidian exposes the configured UI language directly via getLanguage().
 * We only support RU/EN for now and fall back to English for any other locale.
 */
export function getCurrentLocale(): SupportedLocale {
	return getLanguage().toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function getLocalization(locale = getCurrentLocale()): Localization {
	return LOCALIZATIONS[locale];
}
