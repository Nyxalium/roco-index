import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { ArrowRight, ArrowUpRight, BookOpen, Heart, PawPrint, Shuffle } from 'lucide-react';
import Artwork from './Artwork';
import Diorama from './Diorama';
import { representativeAsset } from './bundles';
import { creatures, skills } from './compendium';
import { familyName, profileFor } from './data';
import type { Asset } from './data';

const favourites = ['Dimo', 'Meevy', 'Sparka', 'Cerulla', 'Duckiji'];
export default function Hero({ families, onOpen, onCollection }: { families: Asset[]; onOpen: (id: string) => void; onCollection: () => void }) {
  const [active, setActive] = useState(0);
  const [affection, setAffection] = useState(0);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = useAnimationControls();
  useEffect(() => { const query = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => { if (query.matches) { controls.stop(); controls.set({ y: 0, rotate: 0, scale: 1 }); } }; query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, [controls]);
  const featured = favourites.flatMap(name => families.filter(family => familyName(family) === name));
  const family = featured[active] || featured[0];
  if (!family) return null;
  const name = familyName(family);
  const profile = profileFor(family);
  const choose = (index: number) => { controls.stop(); controls.set({ y: 0, rotate: 0, scale: 1 }); setActive(index); setAffection(0); };
  const pet = () => { setAffection(value => value + 1); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) void controls.start({ y: [0, -30, 0, -10, 0], rotate: [0, -6, 6, -3, 0], scale: [1, 1.05, .97, 1] }); };
  return <section className="field-hero" aria-label="Roco Kingdom fan companion">
    <div className="field-hero-copy"><span className="fan-note"><PawPrint size={15} />Unofficial fan companion</span><h1>Roco<span className="hero-title-word">Index</span><span className="hero-title-sticker" aria-hidden="true"><PawPrint /></span></h1><div className="hero-functional-copy"><BookOpen size={18} /><p>Creature records, team planning<br />and your own collection.</p></div><div className="field-hero-actions"><a className="button button-ink" href="#/compendium">Find a Jini <ArrowRight size={18} /></a><button className="text-button" onClick={onCollection}>My collection <Heart size={16} /></button></div><div className="hero-mini-index"><span><strong>{creatures.length}</strong>form records</span><span><strong>{skills.length}</strong>skills</span><a href="#/sources">Data notes <ArrowUpRight size={13} /></a></div></div>
    <div className="field-hero-world"><div className="world-backdrop" aria-hidden="true"><span className="world-moon" /><span className="world-cloud cloud-one" /><span className="world-cloud cloud-two" /><span className="world-cloud cloud-three" /><svg viewBox="0 0 600 420"><path d="M30 210Q140 25 330 90T570 240" /><path d="m54 270 10-18 12 17m437-118 7-15 10 14" /></svg></div><Diorama />
      <motion.button className="hero-jini" key={family.documentId} aria-label={`Pet ${name}`} onClick={pet} animate={controls} transition={{ duration: .62 }}><Artwork url={family.coverImage?.[0]} name={name} eager /><span className="pet-hint"><Heart size={15} />Pet</span></motion.button>
      <AnimatePresence>{affection > 0 && <motion.div className="pet-hearts" key={affection} aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>{[-1, 0, 1].map((direction, i) => <motion.span key={i} initial={{ y: 0, x: direction * 25, scale: .5 }} animate={{ y: reduced ? -10 : -80 - i * 14, x: direction * 65, scale: 1 }} transition={{ duration: .9 }}><Heart size={22 + i * 5} fill="currentColor" /></motion.span>)}</motion.div>}</AnimatePresence>
      <button className="world-specimen-label" onClick={() => onOpen(family.documentId)}><span className="specimen-label-hole" /><span><small>{profile?.type || 'Jini'}</small><strong>{name}</strong></span><ArrowUpRight size={20} /></button><button className="world-shuffle" onClick={() => choose((active + 1) % featured.length)} aria-label="Meet another featured Jini"><Shuffle size={18} /></button>
    </div>
    <div className="field-hero-roster" aria-label="Choose featured Jini">{featured.map((item, index) => <button key={item.documentId} className={index === active ? 'active' : ''} onClick={() => choose(index)} aria-label={`Feature ${familyName(item)}`} aria-pressed={index === active}><Artwork url={representativeAsset(item, 'icon')?.url || item.coverImage?.[0]} name="" /><span>{familyName(item)}</span>{index === active && <PawPrint className="selected-paw" size={13} />}</button>)}</div>
  </section>;
}
