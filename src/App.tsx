import MobileNavigation from './MobileNavigation';
import LanguageToggle from './LanguageToggle';
import UiSounds from './UiSounds';
import { displayText, useContentLanguage } from './localization';
import { CreatureLabel } from './LocalizedText';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, BookOpen, Images, Compass, Egg, GitCompareArrows, MapPin, RefreshCw, Search, Swords, X } from 'lucide-react';
import Brand from './Brand';
import Artwork from './Artwork';
import Hero from './Hero';
import Catalogue from './Catalogue';
import FamilyDialog from './FamilyDialog';
import Compendium from './Compendium';
import CreatureDialog from './CreatureDialog';
import Comparison from './Comparison';
import Skills, { SkillDialog } from './Skills';
import TeamLab from './TeamLab';
import Breeding from './Breeding';
import Locations from './Locations';
import CollectionPage from './CollectionPage';
import Sources from './Sources';
import GlobalSearch from './GlobalSearch';
import Notice from './Notice';
import News from './News';
import Resources from './Resources';
import SiteFooter from './SiteFooter';
import useFeeds from './useFeeds';
import useWorkspace from './useWorkspace';
import { familyName, initialAssets, readRoute, snapshotDate } from './data';
import { creatureById, creatureImage, creatureName, skillById } from './compendium';
import { collectionKey, loadCollection, parseCollection } from './collection';
import { parseWorkspace, workspaceKey } from './workspace';
import type { CollectionStatus } from './collection';

const viewTitles: Record<string, string> = { catalogue: 'Roco Kingdom companion', compendium: 'Creature compendium', skills: 'Skills & traits', teams: 'Team lab', breeding: 'Breeding reference', locations: 'Location index', collection: 'My collection', news: 'Official news', resources: 'Creator resources', sources: 'Sources & data' };
const quickTools = [['compendium', 'Compendium', '621 form records', Compass], ['skills', 'Skills & traits', 'Learnsets & effects', BookOpen], ['teams', 'Team lab', 'Plan & compare matchups', Swords], ['breeding', 'Breeding', 'Egg group reference', Egg], ['locations', 'Locations', 'Acquisition descriptions', MapPin]] as const;

export default function App() {
  const language = useContentLanguage();
  const [route, setRoute] = useState(readRoute);
  const [initialSaved] = useState(loadCollection);
  const [collection, setCollection] = useState(initialSaved.collection);
  const [legacyReadError, setLegacyReadError] = useState(initialSaved.error);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(initialSaved.error ? { text: initialSaved.error, error: true } : null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compared, setCompared] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const state = useWorkspace(setToast);
  const feeds = useFeeds();
  const families = useMemo(() => feeds.assets.filter(asset => asset.fileType === '4'), [feeds.assets]);
  const japanese = useMemo(() => Object.fromEntries(feeds.japaneseAssets.map(asset => [asset.documentId, asset.title])), [feeds.japaneseAssets]);
  const selectedFamily = families.find(family => family.documentId === route.family);
  const selectedCreature = creatureById.get(route.creature || '');
  const selectedSkill = skillById.get(route.skill || '');
  const collectedCount = Object.values(state.workspace.tracking).filter(record => record.status === 'caught').length;
  const invalidSelection = route.family && !selectedFamily ? 'That artwork family is not in the current catalogue.' : route.creature && !selectedCreature ? 'That creature is not in the current CN snapshot.' : route.skill && !selectedSkill ? 'That skill is not in the current CN snapshot.' : '';
  const navigate = (view: string, selection: Record<string, string> = {}, replace = false) => {
    const query = new URLSearchParams(selection).toString();
    const hash = `#/${view}${query ? `?${query}` : ''}`;
    if (replace) { history.replaceState(null, '', hash); setRoute(readRoute()); } else location.hash = hash;
  };
  const openCreature = (id: string) => { setComparisonOpen(false); navigate(route.view, { creature: id }); };
  const openFamily = (id: string) => navigate(route.view, { family: id });
  const closeSelection = () => navigate(route.view, {}, true);
  const compare = (id: string) => {
    if (compared.includes(id)) setCompared(compared.filter(old => old !== id));
    else if (compared.length >= 3) setToast({ text: 'Compare up to three creatures. Remove one from the comparison tray first.', error: true });
    else setCompared([...compared, id]);
  };
  useEffect(() => {
    const update = () => setRoute(readRoute());
    const storage = (event: StorageEvent) => { if (event.key === collectionKey) { const saved = loadCollection(); setCollection(saved.collection); setLegacyReadError(saved.error); if (saved.error) setToast({ text: saved.error, error: true }); } };
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!document.querySelector('dialog[open]')) setSearchOpen(true); } };
    window.addEventListener('hashchange', update); window.addEventListener('storage', storage); window.addEventListener('keydown', shortcut);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('storage', storage); window.removeEventListener('keydown', shortcut); };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [route.view]);
  useEffect(() => { if (state.readError) setToast({ text: state.readError, error: true }); }, [state.readError]);
  useEffect(() => { if (!toast || toast.error) return; const timer = setTimeout(() => setToast(null), 3400); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { document.title = `${selectedCreature ? creatureName(selectedCreature) : selectedSkill ? displayText(selectedSkill.name) : selectedFamily ? `${familyName(selectedFamily)} family` : viewTitles[route.view]} — Roco Index`; }, [route.view, selectedFamily, selectedCreature, selectedSkill, language]);
  const saveCollection = (next: typeof collection, repair = false) => {
    if (legacyReadError && !repair) { setToast({ text: 'The stored artwork checklist could not be read. Restore a valid backup or reset the checklist from Collection before changing it.', error: true }); return false; }
    try { localStorage.setItem(collectionKey, JSON.stringify(next)); setCollection(next); if (repair) setLegacyReadError(null); return true; }
    catch { setToast({ text: 'This browser could not save your artwork checklist. Export a backup before closing the page.', error: true }); return false; }
  };
  const changeStatus = (id: string, status: CollectionStatus) => {
    const next = { ...collection }; if (next[id] === status) delete next[id]; else next[id] = status;
    if (saveCollection(next)) setToast({ text: 'Artwork-family checklist updated.' });
  };
  const importBackup = (value: unknown) => {
    try {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Choose a Roco Index JSON backup.');
      const backup = value as Record<string, unknown>;
      if (backup.version === 1 && 'collection' in backup) {
        const imported = parseCollection(backup.collection);
        if (saveCollection({ ...collection, ...imported }, true)) setToast({ text: `Imported ${Object.keys(imported).length} artwork families. Individual creature tracking is unchanged.` });
        return;
      }
      if (backup.version !== 2) throw new Error('Unsupported backup. Choose a version 1 family checklist or version 2 Roco Index backup.');
      const nextCollection = parseCollection(backup.families); const nextWorkspace = parseWorkspace(backup.workspace);
      if (!confirm('Restore this backup? It replaces your current creature tracking, notes, teams and artwork-family checklist. Export the current data first if you want to keep it.')) return;
      const before = [localStorage.getItem(collectionKey), localStorage.getItem(workspaceKey)];
      try { localStorage.setItem(collectionKey, JSON.stringify(nextCollection)); localStorage.setItem(workspaceKey, JSON.stringify(nextWorkspace)); }
      catch {
        let recovered = true;
        for (const [index, key] of [collectionKey, workspaceKey].entries()) { try { if (before[index] === null) localStorage.removeItem(key); else localStorage.setItem(key, before[index]!); } catch { recovered = false; } }
        throw new Error(recovered ? 'Browser storage failed while restoring. Previous saved data was restored; the backup file is unchanged.' : 'Browser storage failed while restoring and rollback was incomplete. Saved sections may differ. Keep your backup file and retry after fixing storage.');
      }
      setCollection(nextCollection); setLegacyReadError(null); state.reload(); setToast({ text: 'Backup restored: creature tracking, notes, teams and artwork families.' });
    } catch (error) { setToast({ text: error instanceof Error ? error.message : 'The backup could not be restored.', error: true }); }
  };
  return <div className={compared.length ? 'has-comparison-tray' : ''}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    <header className="site-header"><div className="header-inner"><a href="#/catalogue" className="brand-link" aria-label="Roco Index home"><Brand /></a><nav aria-label="Main navigation">{[['catalogue', 'Explore'], ['compendium', 'Compendium'], ['skills', 'Skills'], ['teams', 'Team lab'], ['breeding', 'Breeding'], ['collection', 'Collection']].map(([view, label]) => <a key={view} href={`#/${view}`} className={route.view === view ? 'active' : ''} aria-current={route.view === view ? 'page' : undefined}>{label}{view === 'collection' && collectedCount > 0 && <span className="nav-count">{collectedCount}</span>}</a>)}</nav><div className="header-actions"><UiSounds onSaveError={() => setToast({ text: "Interface sound changed for this visit. This browser could not save your preference.", error: true })} /><LanguageToggle onSaveError={() => setToast({ text: "Language changed for this visit. This browser could not save your preference.", error: true })} /><button className="header-search" aria-label="Search Roco Index" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search</span><kbd>{/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'}</kbd></button></div></div></header>
    {feeds.error && <div className="content-notice" role="status"><span>Some global updates could not load. Saved content is available from {snapshotDate}.</span><button onClick={feeds.refresh} disabled={feeds.loading}><RefreshCw size={15} className={feeds.loading ? 'spinning' : ''} />{feeds.loading ? 'Retrying…' : 'Retry'}</button></div>}
    {invalidSelection && <div className="content-notice" role="alert"><span>{invalidSelection}</span><button onClick={closeSelection}>Close</button></div>}
    <MobileNavigation view={route.view} collected={collectedCount} /><AnimatePresence mode="wait"><motion.main id="main-content" tabIndex={-1} key={route.view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
      {route.view === 'catalogue' && <><Hero families={families} onOpen={openFamily} onCollection={() => navigate('collection')} /><nav className="quick-tools page-width" aria-label="Companion tools">{quickTools.map(([view, label, detail, Icon], index) => <a href={`#/${view}`} key={view}><span className="quick-tool-icon"><Artwork url={initialAssets.find(asset => asset.title === ["Dimo", "Sparka", "Vargyr", "Duckiji", "Cerulla"][index] + " Evolution Line")?.coverImage?.[0]} name="" /><Icon size={15} strokeWidth={1.8} /></span><span><strong>{label}</strong><small>{detail}</small></span><ArrowUpRight size={16} /></a>)}</nav><Catalogue families={families} japanese={japanese} collection={collection} onOpen={openFamily} onStatus={changeStatus} /><section className="creator-postcard page-width"><div><span>Official artwork</span><h2>Wallpapers<br />& artwork</h2><a className="button button-ink" href="#/resources">Browse creator resources <ArrowUpRight size={17} /></a></div><a href="#/resources" className="wallpaper-preview" aria-label="Browse official Jini wallpapers"><img src="/media/dimo-wallpaper.webp" alt="Official illustration of Dimo floating in a pool" loading="lazy" /><span><Images size={15} />Wallpapers</span></a><div className="postcard-art" aria-hidden="true"><Artwork url={initialAssets.find(asset => asset.title === "Duckiji Evolution Line")?.coverImage?.[0]} name="" /></div></section><div className="news-home-wrap"><News articles={feeds.news} compact /></div></>}
      {route.view === 'compendium' && <Compendium state={state} onOpen={openCreature} onCompare={compare} compared={compared} />}
      {route.view === 'skills' && <Skills onSkill={id => navigate('skills', { skill: id })} onCreature={openCreature} />}
      {route.view === 'teams' && <TeamLab state={state} onCreature={openCreature} incoming={route.team} onClearIncoming={closeSelection} notify={setToast} />}
      {route.view === 'breeding' && <Breeding onCreature={openCreature} />}
      {route.view === 'locations' && <Locations onCreature={openCreature} />}
      {route.view === 'collection' && <CollectionPage legacyReadError={legacyReadError} onResetFamilies={() => { if (confirm("Reset the unreadable artwork-family checklist? Download its stored value first if you need to preserve it.")) saveCollection({}, true); }} state={state} families={families} japanese={japanese} collection={collection} onStatus={changeStatus} onFamily={openFamily} onCreature={openCreature} onCompare={compare} compared={compared} onImport={importBackup} notify={setToast} />}
      {route.view === 'sources' && <Sources />}
      {route.view === 'news' && <><section className="page-heading page-width"><h1>Official<br />news<span className="title-period">.</span></h1><a className="button button-outline" href="https://rocokingdom.com/news/" target="_blank" rel="noopener noreferrer">Official news centre <ArrowUpRight size={16} /></a></section><News articles={feeds.news} /></>}
      {route.view === 'resources' && <><section className="page-heading page-width resource-page-heading"><h1>Creator resources<span className="title-period">.</span></h1><a className="button button-outline" href="https://rocokingdom.com/creator/images.html?lang=en" target="_blank" rel="noopener noreferrer">Official library <ArrowUpRight size={16} /></a></section><Resources assets={feeds.assets} /></>}
    </motion.main></AnimatePresence>
    <SiteFooter families={families} />
    <AnimatePresence mode="wait">{searchOpen ? <GlobalSearch key="global-search" families={families} onClose={() => setSearchOpen(false)} onNavigate={view => navigate(view)} onCreature={openCreature} onSkill={id => navigate('skills', { skill: id })} onFamily={openFamily} /> : comparisonOpen ? <Comparison key="comparison" ids={compared} onClose={() => setComparisonOpen(false)} onOpen={openCreature} /> : selectedFamily ? <FamilyDialog key={selectedFamily.documentId} family={selectedFamily} japaneseTitle={japanese[selectedFamily.documentId]} status={collection[selectedFamily.documentId]} onStatus={status => changeStatus(selectedFamily.documentId, status)} onClose={closeSelection} onCreature={id => navigate(route.view, { creature: id })} /> : selectedCreature ? <CreatureDialog key={selectedCreature.id} creature={selectedCreature} state={state} compared={compared.includes(selectedCreature.id)} onCompare={compare} onOpen={openCreature} onClose={closeSelection} onFamily={openFamily} /> : selectedSkill ? <SkillDialog key={selectedSkill.id} skill={selectedSkill} onClose={closeSelection} onCreature={openCreature} /> : null}</AnimatePresence>
    <AnimatePresence>{compared.length > 0 && <motion.aside className="comparison-tray" aria-label="Creature comparison tray" initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 25, opacity: 0 }}><GitCompareArrows size={21} /><div className="comparison-tray-members">{compared.map(id => { const creature = creatureById.get(id)!; return <span key={id}><Artwork url={creatureImage(creature)} name={creatureName(creature)} /><span><CreatureLabel creature={creature} /></span><button aria-label={`Remove ${creatureName(creature)} from comparison`} onClick={() => compare(id)}><X size={13} /></button></span>; })}</div><button className="button button-purple" disabled={compared.length < 2} onClick={() => setComparisonOpen(true)}>Compare {compared.length}/3</button><button className="tray-clear" onClick={() => setCompared([])} aria-label="Clear comparison"><X size={17} /></button></motion.aside>}</AnimatePresence>
    <AnimatePresence>{toast && <Notice notice={toast} aboveTray={compared.length > 0} onDismiss={() => setToast(null)} />}</AnimatePresence>
  </div>;
}
