/**
 * 纪程 i18n 基础设施
 * 轻量级翻译模块，基于 Svelte 5 runes
 */

// Direct import of locale data (type-safe with resolveJsonModule)
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

export type Locale = 'zh-CN' | 'en';

let currentLocale: Locale = $state('zh-CN');

const locales: Record<string, Record<string, string>> = {
	'zh-CN': zhCN as Record<string, string>,
	'en': en as Record<string, string>,
};

export function setLocale(locale: Locale) {
	currentLocale = locale;
}

export function getLocale(): Locale {
	return currentLocale;
}

/**
 * 翻译函数
 * @param key - 翻译键
 * @param params - 可选参数，如 {name: '张三'} 会替换翻译中的 {name}
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const localeData = locales[currentLocale];
	let text = localeData?.[key];
	if (!text) return key;

	if (params) {
		for (const [k, v] of Object.entries(params)) {
			text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
		}
	}

	return text;
}
