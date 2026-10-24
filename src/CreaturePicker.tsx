import LocalizedText, { CreatureLabel } from './LocalizedText';
import { useDeferredValue, useState } from 'react';
import { Search } from 'lucide-react';
import Artwork from './Artwork';
import Modal from './Modal';
import ElementBadge from './ElementBadge';
import { catalogueNumber, creatureImage, creatureName, creatures, matchesCreature } from './compendium';

export default function CreaturePicker({ title = 'Choose a creature', onSelect, onClose }: { title?: string; onSelect: (id: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [forms, setForms] = useState(false);
  const [limit, setLimit] = useState(24);
  const deferred = useDeferredValue(query);
  const results = creatures.filter(creature => (forms || creature.primary) && matchesCreature(creature, deferred));
  return <Modal className="picker-modal" labelledBy="picker-title" onClose={onClose} closeLabel="Close creature picker"><div className="picker-inner"><h2 id="picker-title">{title}</h2><div className="picker-toolbar"><label className="search-box"><Search size={18} /><input autoFocus type="search" aria-label="Find a creature" placeholder="Name, Chinese name, or number…" value={query} onChange={event => { setQuery(event.target.value); setLimit(24); }} /></label><label className="checkbox-label"><input type="checkbox" checked={forms} onChange={event => setForms(event.target.checked)} />Include forms</label></div><span className="result-count" aria-live="polite">{results.length} records</span><div className="picker-grid">{results.slice(0, limit).map(creature => <button className="picker-creature" key={creature.id} onClick={() => onSelect(creature.id)}><Artwork url={creatureImage(creature)} name={creatureName(creature)} /><span><small>{catalogueNumber(creature)}</small><strong><CreatureLabel creature={creature} /></strong>{creature.form && <small><LocalizedText text={creature.form} /></small>}<span className="type-row">{creature.types.map(type => <ElementBadge type={type} key={type} compact />)}</span></span></button>)}</div>{!results.length && <p className="quiet-empty">No matching creatures. Try an English or Chinese name, or a catalogue number.</p>}{results.length > limit && <button className="button button-outline picker-more" onClick={() => setLimit(limit + 24)}>Show more</button>}</div></Modal>;
}
