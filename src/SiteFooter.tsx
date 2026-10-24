import { ArrowUp, ArrowUpRight } from 'lucide-react';
import Artwork from './Artwork';
import Brand from './Brand';
import { familyName } from './data';
import type { Asset } from './data';

const links = [
  { label: 'Companion', items: [['Compendium', 'compendium'], ['Team lab', 'teams'], ['Breeding', 'breeding'], ['Locations', 'locations']] },
  { label: 'Resources', items: [['News', 'news'], ['Creator resources', 'resources'], ['Sources & data', 'sources']] },
];

export default function SiteFooter({ families }: { families: Asset[] }) {
  const mascots = ['Duckiji', 'Dimo'].flatMap(name => families.filter(family => familyName(family) === name));
  return <footer className="site-footer">
    <svg className="footer-edge" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true"><path d="M0 33C190 72 330 5 520 18S830 75 1030 31 1280 9 1440 33V64H0Z" fill="currentColor" /></svg>
    <div className="footer-inner page-width">
      <div className="footer-content">
        <div className="footer-about">
          <a href="#/catalogue" className="brand-link" aria-label="Roco Index home"><Brand /></a>
          <p>An independent Roco Kingdom<br /> fan project.</p>
          <a className="footer-official" href="https://rocokingdom.com/" target="_blank" rel="noopener noreferrer">Official game site <ArrowUpRight size={15} /></a>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">{links.map(group => <div className="footer-link-group" key={group.label}><h2>{group.label}</h2><ul>{group.items.map(([label, route]) => <li key={route}><a href={`#/${route}`}>{label}</a></li>)}</ul></div>)}</nav>
        <div className="footer-jinies" aria-label="Featured Jini artwork">
          <span className="footer-spark footer-spark-one" aria-hidden="true">✦</span><span className="footer-spark footer-spark-two" aria-hidden="true">✧</span>
          {mascots.map(family => <a className={`footer-mascot footer-mascot-${familyName(family).toLowerCase()}`} key={family.documentId} href={`#/catalogue?family=${family.documentId}`} aria-label={`View ${familyName(family)} artwork`}><Artwork url={family.coverImage?.[0]} name="" /><span>{familyName(family)}</span></a>)}
        </div>
      </div>
      <div className="footer-credits"><p>Game artwork © Morefun Studios / Tencent.</p><button className="footer-back-top" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <span><ArrowUp size={18} /></span></button></div>
    </div>
  </footer>;
}
