import { displayText, translatedSearchText } from './localization';
import LocalizedText, { CreatureLabel } from './LocalizedText';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Bookmark, Check, Eye, GitCompareArrows, MapPin, Plus, Ruler, Search, Weight } from 'lucide-react';
import Artwork from './Artwork';
import Modal from './Modal';
import ElementBadge from './ElementBadge';
import gameUi from './data/game-ui.json';
import StatRadar from './StatRadar';
import { InlineArtworkBundle } from './ArtworkBundle';
import { bundleFor } from './bundles';
import { familyName } from './data';
import { SourceBadge } from './Compendium';
import { catalogueNumber, creatureById, creatureImage, creatureName, globalFamilyFor, methodLabels, skillById, stageLabels, statLabels } from './compendium';
import type { Creature } from './compendium';
import type { CompanionState } from './useWorkspace';

export default function CreatureDialog({ creature, state, compared, onCompare, onOpen, onClose, onFamily }: { creature: Creature; state: CompanionState; compared: boolean; onCompare: (id: string) => void; onOpen: (id: string) => void; onClose: () => void; onFamily: (id: string) => void }) {
  const [tab, setTab] = useState('overview');
  const [compactHeader, setCompactHeader] = useState(false);
  const [method, setMethod] = useState('all');
  const [skillQuery, setSkillQuery] = useState('');
  const [skillLimit, setSkillLimit] = useState(24);
  const [note, setNote] = useState(state.workspace.tracking[creature.id]?.note || '');
  const tracked = state.workspace.tracking[creature.id];
  const relatives = [...new Set([...creature.evolutions, ...creature.forms])].map(id => creatureById.get(id)!);
  const globalFamily = globalFamilyFor(creature);
  const artBundle = bundleFor(globalFamily);
  const learnset = creature.learnset.filter(entry => {
    const skill = skillById.get(entry.id)!;
    return (method === 'all' || entry.method === method) && translatedSearchText(skill.name, skill.description).includes(skillQuery.trim().toLocaleLowerCase());
  });
  return <Modal className="creature-modal" labelledBy="creature-title" onClose={onClose} closeLabel="Close creature profile"><div className="creature-profile">
    <aside className="profile-art-panel"><div className="profile-art-orbit" /><span className="profile-number" aria-hidden="true">{String(creature.number).padStart(3, '0')}</span><Artwork url={creatureImage(creature)} name={creatureName(creature)} eager /><div className="profile-art-bottom"><span>{catalogueNumber(creature)}</span><span>{creature.stage ? <LocalizedText text={creature.stage} /> : stageLabels[creature.stage]}</span></div><StatRadar creatures={[creature]} /></aside>
    <div className="profile-content">
      <div className={`profile-header ${compactHeader ? 'is-compact' : ''}`}>
        <div className="profile-source"><div><SourceBadge /></div></div>
        <div className="profile-title-row">
          <motion.div layout="position" className="profile-name-block"><h2 id="creature-title"><CreatureLabel creature={creature} /></h2>{creature.form && <p className="profile-form"><LocalizedText text={creature.form} /></p>}</motion.div>
          <motion.div layout="position" className="profile-total"><strong>{creature.total}</strong><span>{compactHeader ? 'total' : 'base stat total'}</span></motion.div>
        </div>
        <motion.div layout="position" className="type-row profile-types">{creature.types.map(type => <ElementBadge type={type} key={type} />)}</motion.div>
        <motion.div layout="position" className="profile-command-row">
          <motion.div layout="position" className="profile-actions"><button className="button button-ink" aria-label="Add to team" title="Add to team" onClick={() => state.addToTeam(creature.id)}><Plus size={16} /><span>Add to team</span></button><button className={`button button-outline ${compared ? 'is-active' : ''}`} aria-label={compared ? 'In comparison' : 'Compare'} title={compared ? 'In comparison' : 'Compare'} aria-pressed={compared} onClick={() => onCompare(creature.id)}><GitCompareArrows size={16} /><span>{compared ? 'In comparison' : 'Compare'}</span></button></motion.div>
          <motion.div layout="position" className="tracking-buttons" aria-label="Creature collection status">{([['caught', 'Caught', Check], ['seen', 'Seen', Eye], ['wanted', 'Wishlist', Bookmark]] as const).map(([value, label, Icon]) => <button key={value} className={tracked?.status === value ? 'active' : ''} aria-label={label} title={label} aria-pressed={tracked?.status === value} onClick={() => state.setStatus(creature.id, value)}><Icon size={14} /><span>{label}</span></button>)}</motion.div>
        </motion.div>
      </div>
      <div className="profile-tabs" aria-label="Creature information">{[['overview', 'Overview'], ['skills', `Learnset ${creature.learnset.length}`], ['forms', `Related ${relatives.length}`], ['notes', 'Notes'], ...(artBundle ? [['artwork', 'Artwork']] : [])].map(([value, label]) => <button key={value} aria-pressed={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{label}</button>)}</div>
      <div className="profile-scroll-body" role="region" aria-label="Creature details" tabIndex={0} onScroll={event => {
        const body = event.currentTarget;
        if (body.scrollTop < 8) setCompactHeader(false);
        else if (body.scrollTop > 24 && body.scrollHeight - body.clientHeight > 260) setCompactHeader(true);
      }}>
      {tab === 'overview' && <div className="profile-overview"><div className="stat-bars">{creature.stats.map((value, index) => <div key={index}><span><Artwork url={gameUi.stats[index]} name="" className="game-stat-icon" fallback={<></>} />{statLabels[index]}</span><strong>{value}</strong><span className="stat-track"><span style={{ width: `${value / Math.max(180, ...creature.stats) * 100}%` }} /></span></div>)}</div><div className="trait-box"><span className="field-label">Trait</span><h3>{creature.trait.name ? <LocalizedText text={creature.trait.name} /> : 'Not listed'}</h3><p>{creature.trait.description ? <LocalizedText text={creature.trait.description} prose /> : 'No description in this snapshot.'}</p></div>{creature.description && <p className="creature-description"><LocalizedText text={creature.description} prose /></p>}<div className="profile-measurements"><span><Ruler size={15} />{creature.height || 'Height unlisted'}</span><span><Weight size={15} />{creature.weight || 'Weight unlisted'}</span></div><div className="profile-location"><MapPin size={16} /><div><h3>Recorded locations</h3><p >{creature.location ? <LocalizedText text={creature.location} prose /> : 'No acquisition location listed in this snapshot.'}</p></div></div>{globalFamily && <button className="text-button" onClick={() => onFamily(globalFamily.documentId)}>View official global art family ↗</button>}</div>}
      {tab === 'skills' && <div className="profile-learnset"><div className="learnset-controls"><div className="segmented-control">{[['all', 'All'], ...Object.entries(methodLabels)].map(([value, label]) => <button key={value} aria-pressed={method === value} onClick={() => { setMethod(value); setSkillLimit(24); }}>{label}</button>)}</div><label className="search-box learnset-search"><Search size={17} /><input type="search" aria-label="Search this learnset" placeholder="Search skills or effects…" value={skillQuery} onChange={event => { setSkillQuery(event.target.value); setSkillLimit(24); }} /></label><p className="small-note" aria-live="polite">Showing {Math.min(skillLimit, learnset.length)} of {learnset.length} recorded skills</p></div><div className="learnset-list">{learnset.slice(0, skillLimit).map((entry, index) => { const skill = skillById.get(entry.id)!; return <details key={`${entry.id}-${entry.method}-${index}`} className="learnset-skill"><summary><span className="learn-level">{entry.level === null ? methodLabels[entry.method] : `Lv. ${entry.level}`}</span><span className="learn-name"><LocalizedText text={skill.name} /><small>{displayText(skill.category)}</small></span><ElementBadge type={skill.element} compact /><span className="skill-numeric"><strong>{skill.energy ?? '—'}</strong><small>energy</small></span><span className="skill-numeric"><strong>{skill.power ?? '—'}</strong><small>power</small></span></summary><p><LocalizedText text={skill.description} prose /></p></details>; })}{learnset.length > skillLimit && <button className="text-button learnset-more" onClick={() => setSkillLimit(skillLimit + 24)}>Show more skills <ArrowDown size={14} /></button>}{!learnset.length && <p className="quiet-empty">No matching skills. Try a different search or learning method.</p>}</div></div>}
      {tab === 'forms' && <div className="profile-relatives"><p className="small-note">Related forms and evolution records from the source. This list does not establish an evolution order or requirements.</p><div className="relative-grid">{relatives.map(relative => <button key={relative.id} onClick={() => onOpen(relative.id)}><Artwork url={creatureImage(relative)} name={creatureName(relative)} /><strong><CreatureLabel creature={relative} /></strong><small>{relative.form || relative.stage ? <LocalizedText text={relative.form || relative.stage} /> : stageLabels[relative.stage]}</small></button>)}</div>{!relatives.length && <p className="quiet-empty">No related records listed.</p>}</div>}
      {tab === 'artwork' && artBundle && globalFamily && <InlineArtworkBundle bundle={artBundle} name={familyName(globalFamily)} onFamily={() => onFamily(globalFamily.documentId)} />}
      {tab === 'notes' && <div className="profile-notes"><label htmlFor="creature-note">Your notes</label><textarea id="creature-note" key={creature.id} value={note} onChange={event => setNote(event.target.value)} maxLength={2000} rows={7} placeholder="Build ideas, locations to revisit, or collection notes…" /><button className="button button-outline save-note" onClick={() => state.setNote(creature.id, note)}><Check size={14} />{note.trim() === (tracked?.note || '') ? 'Note saved' : 'Save note'}</button><p className="small-note">Saved notes stay in this browser and are included in companion backups.</p></div>}
      </div>
    </div></div></Modal>;
}
