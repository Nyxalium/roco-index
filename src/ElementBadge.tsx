import { displayText, useContentLanguage } from './localization';
import type { CSSProperties } from 'react';
import { Bug, Circle, Cog, Droplets, Feather, Flame, Ghost, Heart, Hexagon, Leaf, Moon, Mountain, Orbit, Shield, Snowflake, Sun, Swords, Zap } from 'lucide-react';
import { elementColors } from './compendium';
import Artwork from './Artwork';
import gameUi from './data/game-ui.json';

const icons: Record<string, typeof Flame> = { '光': Sun, '冰': Snowflake, '地': Mountain, '幻': Orbit, '幽': Ghost, '恶': Moon, '普通': Circle, '机械': Cog, '武': Swords, '毒': Hexagon, '水': Droplets, '火': Flame, '电': Zap, '翼': Feather, '草': Leaf, '萌': Heart, '虫': Bug, '龙': Shield };
export default function ElementBadge({ type, compact = false }: { type: string; compact?: boolean }) {
  const language = useContentLanguage();
  const Icon = icons[type] || Circle;
  const url = (gameUi.elements as Record<string, string>)[type];
  return <span className={`element-badge ${compact ? 'compact' : ''}`} style={{ '--element': elementColors[type] || '#787389' } as CSSProperties} lang={language} title={displayText(type)}><Artwork key={url || type} url={url} name="" className="game-element-icon" eager fallback={<Icon size={compact ? 12 : 14} strokeWidth={1.8} />} /><span>{displayText(type)}</span></span>;
}
