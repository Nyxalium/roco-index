import { useState } from 'react';
import { BookOpen, Compass, Egg, Heart, Images, MapPin, MoreHorizontal, Newspaper, ShieldCheck, Swords, Zap } from 'lucide-react';
import Modal from './Modal';

const mainLinks = [['catalogue', 'Home', Compass], ['compendium', 'Jinies', BookOpen], ['teams', 'Teams', Swords], ['collection', 'Collection', Heart]] as const;
const allLinks = [...mainLinks, ['skills', 'Skills & traits', Zap], ['breeding', 'Breeding reference', Egg], ['locations', 'Location index', MapPin], ['news', 'Official news', Newspaper], ['resources', 'Creator resources', Images], ['sources', 'Sources & data', ShieldCheck]] as const;
export default function MobileNavigation({ view, collected }: { view: string; collected: number }) {
  const [open, setOpen] = useState(false);
  return <><nav className="mobile-navigation" aria-label="Mobile navigation">{mainLinks.map(([id, label, Icon]) => <a href={`#/${id}`} key={id} className={view === id ? 'active' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => { if (view === id) window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}><span><Icon size={22} strokeWidth={1.7} />{id === 'collection' && collected > 0 && <i>{collected}</i>}</span><small>{label}</small></a>)}<button className={allLinks.slice(4).some(([id]) => id === view) ? 'active' : ''} aria-label="More tools" aria-expanded={open} onClick={() => setOpen(true)}><span><MoreHorizontal size={24} /></span><small>More</small></button></nav>{open && <Modal className="tools-menu-modal" labelledBy="tools-menu-title" onClose={() => setOpen(false)}><div className="tools-menu"><h2 id="tools-menu-title">Roco Index</h2><div>{allLinks.map(([id, label, Icon]) => <a href={`#/${id}`} key={id} aria-current={view === id ? 'page' : undefined} onClick={() => setOpen(false)}><Icon size={23} strokeWidth={1.5} /><span>{label}</span></a>)}</div></div></Modal>}</>;
}
