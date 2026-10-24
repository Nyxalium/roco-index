import { useSyncExternalStore } from 'react';
import catalogue from './data/compendium.en.json';

export const translationCatalogue = catalogue;
export type TranslationEntry = typeof catalogue.entries[number];
const entries = new Map(catalogue.entries.map(entry => [entry.zh, entry]));
export const translationFor = (source: string) => entries.get(source);
export const english = (source: string) => source ? entries.get(source)?.en || (/\p{Script=Han}/u.test(source) ? 'English translation unavailable' : source) : '';
export const displayText = (source: string) => contentLanguage === 'zh-CN' ? source : english(source);
export const translatedSearchText = (...sources: string[]) => sources.map(source => `${source} ${entries.get(source)?.en || ''}`).join(' ').toLocaleLowerCase();
export const translationCounts = {
  total: catalogue.entries.length,
  unofficial: catalogue.entries.filter(entry => entry.method === 'unofficial').length,
  official: catalogue.entries.filter(entry => entry.method === 'official').length,
};

export type ContentLanguage = 'en' | 'zh-CN';
const languageKey = 'roco-index:language:v1';
let contentLanguage: ContentLanguage = 'en';
try { if (localStorage.getItem(languageKey) === 'zh-CN') contentLanguage = 'zh-CN'; } catch { /* A saved language preference is optional. */ }
const languageListeners = new Set<() => void>();
const subscribeLanguage = (listener: () => void) => { languageListeners.add(listener); return () => { languageListeners.delete(listener); }; };
export const getContentLanguage = () => contentLanguage;
export const useContentLanguage = () => useSyncExternalStore(subscribeLanguage, getContentLanguage, () => 'en' as ContentLanguage);
export function setContentLanguage(language: ContentLanguage) {
  contentLanguage = language;
  let saved = true;
  try { localStorage.setItem(languageKey, language); } catch { saved = false; }
  languageListeners.forEach(listener => listener());
  return saved;
}
window.addEventListener('storage', event => {
  if (event.key !== languageKey && event.key !== null) return;
  contentLanguage = event.newValue === 'zh-CN' ? 'zh-CN' : 'en';
  languageListeners.forEach(listener => listener());
});
