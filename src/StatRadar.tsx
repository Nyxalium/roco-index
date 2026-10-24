import { creatureName, statLabels } from './compendium';
import type { Creature } from './compendium';

const colours = ['#7260dc', '#e18b87', '#5f9bbb'];
export default function StatRadar({ creatures }: { creatures: Creature[] }) {
  const maximum = Math.max(160, ...creatures.flatMap(creature => creature.stats));
  const point = (index: number, ratio: number) => {
    const angle = index * Math.PI / 3 - Math.PI / 2;
    return `${160 + Math.cos(angle) * 102 * ratio},${145 + Math.sin(angle) * 102 * ratio}`;
  };
  return <svg className="stat-radar" viewBox="0 0 320 295" role="img" aria-label={creatures.map(creature => `${creatureName(creature)}: ${statLabels.map((label, i) => `${label} ${creature.stats[i]}`).join(', ')}`).join('. ')}>
    {[0.25, 0.5, 0.75, 1].map(ratio => <polygon key={ratio} points={statLabels.map((_, i) => point(i, ratio)).join(' ')} fill="none" stroke="currentColor" strokeOpacity="0.1" />)}
    {statLabels.map((label, index) => { const [x, y] = point(index, 1.29).split(','); return <g key={label}><line x1="160" y1="145" x2={point(index, 1).split(',')[0]} y2={point(index, 1).split(',')[1]} stroke="currentColor" strokeOpacity="0.08" /><text x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text></g>; })}
    {creatures.map((creature, index) => <polygon key={creature.id} points={creature.stats.map((value, i) => point(i, value / maximum)).join(' ')} fill={colours[index]} fillOpacity="0.13" stroke={colours[index]} strokeWidth="2" strokeLinejoin="round" />)}
  </svg>;
}
