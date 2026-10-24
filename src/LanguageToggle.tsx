import { setContentLanguage, useContentLanguage } from './localization';

export default function LanguageToggle({ onSaveError }: { onSaveError: () => void }) {
  const language = useContentLanguage();
  const chinese = language === 'zh-CN';
  return <button className="language-toggle" type="button" aria-label="Use original Chinese text" aria-pressed={chinese} title={chinese ? 'Show English translations' : 'Show original Chinese text'} onClick={() => { if (!setContentLanguage(chinese ? 'en' : 'zh-CN')) onSaveError(); }}><span className="language-flag" aria-hidden="true">{chinese ? '🇨🇳' : '🇬🇧'}</span><span lang={language}>{chinese ? '中文' : 'EN'}</span></button>;
}
