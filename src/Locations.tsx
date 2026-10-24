import LocalizedText, { CreatureLabel } from './LocalizedText';
import { translatedSearchText } from './localization';
import { useDeferredValue, useState } from 'react';
import { ArrowDown, ArrowUpRight, MapPin, Search } from 'lucide-react';
import Artwork from './Artwork';
import { SourceBadge } from './Compendium';
import { creatureImage, creatureName, creatures, matchesCreature } from './compendium';

const recorded = creatures.filter(creature => creature.location);
const grouped = new Map<string, typeof creatures>();
for (const creature of recorded) {
  if (!creature.primary) continue;
  const group = grouped.get(creature.location);
  if (group) group.push(creature); else grouped.set(creature.location, [creature]);
}
const locationGroups = [...grouped.entries()];
export default function Locations({ onCreature }: { onCreature: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(20);
  const deferred = useDeferredValue(query.trim().toLocaleLowerCase());
  const results = locationGroups.filter(([location, records]) => translatedSearchText(location).includes(deferred) || records.some(creature => matchesCreature(creature, deferred)));
  return <div className="page-width reference-page"><header className="reference-heading"><div><SourceBadge /><h1>Location<br />index<span className="title-period">.</span></h1></div><div className="reference-heading-art"><MapPin size={75} strokeWidth={.8} /><strong>{recorded.length}</strong><span>forms with location text</span></div></header><p className="location-intro">Search the translated and original location descriptions or find where a creature is recorded. These are text records; map coordinates are not supplied.</p><label className="search-box location-search"><Search size={20} /><input aria-label="Search locations" type="search" placeholder="English or Chinese location, creature, or number…" value={query} onChange={event => { setQuery(event.target.value); setLimit(20); }} /></label><div className="library-count"><span aria-live="polite">{results.length} distinct descriptions</span><span>Main catalogue entries</span></div><div className="location-grid">{results.slice(0, limit).map(([location, records], index) => <article className="location-card" key={location}><div className="location-card-top"><MapPin size={17} /><span>{String(index + 1).padStart(2, '0')}</span><small>{records.length} {records.length === 1 ? 'entry' : 'entries'}</small></div><h2><LocalizedText text={location} prose /></h2><div className="location-creatures">{records.slice(0, 6).map(creature => <button key={creature.id} onClick={() => onCreature(creature.id)}><Artwork url={creatureImage(creature)} name={creatureName(creature)} /><span><CreatureLabel creature={creature} /></span><ArrowUpRight size={12} /></button>)}</div>{records.length > 6 && <details><summary>{records.length - 6} more entries</summary><div className="location-creatures">{records.slice(6).map(creature => <button key={creature.id} onClick={() => onCreature(creature.id)}><span><CreatureLabel creature={creature} /></span><ArrowUpRight size={12} /></button>)}</div></details>}</article>)}</div>{!results.length && <p className="quiet-empty">No matching location records. Try an English or Chinese name.</p>}{results.length > limit && <div className="load-more"><button className="button button-outline" onClick={() => setLimit(limit + 20)}>Show more locations <ArrowDown size={16} /></button></div>}<p className="data-footnote">Missing acquisition text is shown as unlisted on the creature’s profile. No location or coordinate is guessed.</p></div>;
}
