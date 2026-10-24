import raw from './data/compendium.json';
import chart from './data/type-chart.json';
import { english, getContentLanguage, translatedSearchText, translationCatalogue } from './localization';
import { familyName, initialAssets } from './data';

export interface Skill {
  id: string; name: string; category: string; element: string;
  energy: number | null; power: number | null; description: string;
}
export interface LearnsetEntry { id: string; level: number | null; method: 's' | 'b' | 't' }
export interface Creature {
  id: string; sourceId: number; number: number; name: string; fullName: string;
  form: string; stage: string; types: string[]; stats: number[]; total: number;
  trait: { name: string; description: string }; description: string;
  height: string; weight: string; location: string; nickname: string;
  evolutions: string[]; forms: string[]; learnset: LearnsetEntry[];
  eggGroups: string[] | null; primary: boolean; alias: string | null; image: string;
}
export const compendium = raw as unknown as {
  source: typeof raw.source; elements: string[]; eggGroups: string[];
  creatures: Creature[]; skills: Skill[];
};
if (translationCatalogue.source.sha256 !== compendium.source.sha256) throw new Error('The English translation catalogue does not match the Chinese data snapshot. Rebuild it with scripts/translate-compendium.py.');
export const creatures = compendium.creatures;
export const skills = compendium.skills;
export const creatureById = new Map(creatures.map(creature => [creature.id, creature]));
export const skillById = new Map(skills.map(skill => [skill.id, skill]));
export const primaryCreatures = creatures.filter(creature => creature.primary);
export const typeModel = chart;
export const statLabels = ['HP', 'Attack', 'Sp. Atk', 'Defence', 'Sp. Def', 'Speed'];
export const methodLabels = { s: 'Creature skills', b: 'Bloodline', t: 'Skill stones' };
export const categoryLabels: Record<string, string> = { '物攻': 'Physical', '魔攻': 'Magical', '状态': 'Status', '防御': 'Defence' };
export const stageLabels: Record<string, string> = { '一阶': 'First stage', '二阶': 'Second stage', '最终形态': 'Final stage', '': 'Stage unlisted' };
export const groupLabels: Record<string, string> = {
  '两栖组': 'Amphibian', '动物组': 'Animal', '大地组': 'Earth', '天空组': 'Sky',
  '妖精组': 'Fairy', '巨灵组': 'Giant', '拟人组': 'Humanoid', '昆虫组': 'Insect',
  '未发现': 'Undiscovered', '机械组': 'Mechanical', '植物组': 'Plant', '海洋组': 'Marine',
  '软体组': 'Soft-bodied', '飞龙组': 'Dragon', '魔力组': 'Magic',
};
export const elementLabels: Record<string, string> = {
  '光': 'Light', '冰': 'Ice', '地': 'Earth', '幻': 'Illusion', '幽': 'Ghost',
  '恶': 'Havoc', '普通': 'Common', '机械': 'Mechanical', '武': 'Fighting', '毒': 'Poison',
  '水': 'Water', '火': 'Fire', '电': 'Electric', '翼': 'Wing', '草': 'Flora',
  '萌': 'Cute', '虫': 'Bug', '龙': 'Dragon',
};
export const elementColors: Record<string, string> = {
  '光': '#ce9140', '冰': '#5c98b1', '地': '#a77962', '幻': '#8867ba', '幽': '#6c6a9f',
  '恶': '#675579', '普通': '#8d8194', '机械': '#708996', '武': '#be6968', '毒': '#9b66a5',
  '水': '#5189c9', '火': '#d66e5c', '电': '#ae913d', '翼': '#8c91b8', '草': '#718e85',
  '萌': '#c77f9b', '虫': '#928d62', '龙': '#7d6cb9',
};
export const creatureName = (creature: Creature) => getContentLanguage() === 'zh-CN' ? creature.name : creature.alias || english(creature.name);
export const catalogueNumber = (creature: Creature) => `No. ${String(creature.number).padStart(3, '0')}`;
export const globalFamilyFor = (creature: Creature) => creature.alias ? initialAssets.find(asset => asset.fileType === '4' && familyName(asset) === creature.alias) : undefined;
export const creatureImage = (creature: Creature) => globalFamilyFor(creature)?.coverImage?.[0] || creature.image;
export function matchesCreature(creature: Creature, query: string) {
  const value = query.trim().toLocaleLowerCase();
  return !value || `${creature.alias || ''} ${translatedSearchText(creature.name, creature.fullName, creature.form, creature.nickname, creature.location, creature.trait.name)} ${catalogueNumber(creature)} ${creature.number} ${creature.types.map(type => `${elementLabels[type]} ${type}`).join(' ')}`.toLocaleLowerCase().includes(value);
}
export function skillLearners(skillId: string) {
  return creatures.filter(creature => creature.learnset.some(entry => entry.id === skillId));
}
export function sharedEggGroups(first: Creature, second: Creature): string[] | null {
  if (first.eggGroups === null || second.eggGroups === null) return null;
  return first.eggGroups.filter(group => group !== '未发现' && second.eggGroups!.includes(group));
}
export function typeMultiplier(attack: string, defenders: string[]) {
  const relations = chart.relations as Record<string, { strong: string[]; resisted: string[] }>;
  if (!relations[attack] || !defenders.length || defenders.some(type => !relations[type])) throw new Error('Choose known attacking and defending types.');
  const value = [...new Set(defenders)].reduce((total, type) => total * (relations[attack].strong.includes(type) ? 2 : relations[attack].resisted.includes(type) ? 0.5 : 1), 1);
  return value >= 4 ? chart.dualWeaknessCap : value;
}
export function damageEstimate(input: { attack: number; power: number; defence: number; level: number; hits: number; reduction: number; multiplier: number }) {
  if (Object.values(input).some(value => !Number.isFinite(value)) || input.attack <= 0 || input.power <= 0 || input.defence <= 0 || !Number.isInteger(input.level) || input.level < 1 || input.level > 100 || !Number.isInteger(input.hits) || input.hits < 1 || input.hits > 20 || input.reduction < 0 || input.reduction > 1 || input.multiplier < 0) throw new Error('Enter positive attack, power and defence, whole level 1–100, 1–20 whole hits, and reduction 0–100%.');
  const coefficient = (input.level * 0.45 + 10) / 41;
  const numerator = Math.round(input.attack * input.power * coefficient);
  const oneHit = Math.floor(numerator / input.defence * input.reduction);
  const finalHit = Math.floor(oneHit * input.multiplier);
  if (!Number.isSafeInteger(finalHit * input.hits)) throw new Error('The estimate exceeds the supported numeric range. Reduce the worksheet values.');
  return { coefficient, numerator, oneHit, finalHit, total: finalHit * input.hits };
}
