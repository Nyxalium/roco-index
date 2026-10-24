import { displayText, translationFor, useContentLanguage } from './localization';
import type { Creature } from './compendium';

export default function LocalizedText({ text, prose = false, inline = false }: { text: string; prose?: boolean; inline?: boolean }) {
  const language = useContentLanguage();
  const entry = translationFor(text);
  const explanation = language === 'zh-CN' ? 'Original Chinese text' : entry?.method === 'official' ? 'Official global English name' : entry ? 'Translated from Chinese · Unofficial · Needs review' : undefined;
  return <span className={`localized-text ${prose ? 'localized-prose' : ''} ${inline ? 'localized-inline' : ''}`} lang={language} title={explanation} data-source-sha={entry?.sourceSha256} data-translation-method={entry?.method}>{displayText(text)}</span>;
}

export function CreatureLabel({ creature }: { creature: Creature }) {
  return <LocalizedText text={creature.name} />;
}
