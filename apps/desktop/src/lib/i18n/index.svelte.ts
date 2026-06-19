/**
 * 纪程 i18n 基础设施
 * 轻量级翻译模块，基于 Svelte 5 runes
 *
 * 安全说明：
 * - 此模块不处理用户输入，所有翻译 key 和 params 来自静态代码
 * - params 中的 key 经 escapeRegex 处理，防止正则注入
 * - 使用 @html t(...) 时请确保翻译值不含用户可控的 HTML
 */

import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

export type Locale = 'zh-CN' | 'en';

let currentLocale: Locale = $state('zh-CN');

const locales: Record<string, Record<string, string>> = {
	'zh-CN': zhCN as Record<string, string>,
	'en': en as Record<string, string>,
};

/**
 * 转义字符串中的正则特殊字符
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function setLocale(locale: Locale) {
	if (!locales[locale]) {
		console.warn(`[i18n] Unknown locale: "${locale}", falling back to zh-CN`);
		return;
	}
	currentLocale = locale;
}

export function getLocale(): Locale {
	return currentLocale;
}

/**
 * 翻译函数
 * @param key - 翻译键
 * @param params - 可选参数，如 {name: '张三'} 会替换翻译中的 {name}
 *
 * 回退链: currentLocale → en → raw key
 */
export function t(key: string, params?: Record<string, string | number>): string {
	let text = locales[currentLocale]?.[key];

	// Fallback: try English
	if (!text) {
		text = locales['en']?.[key];
	}

	// Fallback: return raw key
	if (!text) return key;

	if (params) {
		for (const [k, v] of Object.entries(params)) {
			const escaped = escapeRegex(k);
			text = text.replace(new RegExp(`\\{${escaped}\\}`, 'g'), String(v));
		}
	}

	return text;
}
