import { useDeferredValue, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Bookmark, Check, PawPrint, Search, SlidersHorizontal, X } from 'lucide-react';
import Artwork from './Artwork';
import { artworkNames, catalogueOrder, familyName } from './data';
import type { Asset } from './data';
import type { Collection, CollectionStatus } from './collection';

interface Props {
  families: Asset[];
  japanese: Record<string, string>;
  collection: Collection;
  collectionOnly?: boolean;
  onOpen: (id: string) => void;
  onStatus: (id: string, status: CollectionStatus) => void;
}

const tileColours = ['#e5e2fc', '#f5e1e5', '#dce9fa', '#eee2f7', '#e7e8f6', '#f4e4dc'];

export default function Catalogue({ families, japanese, collection, collectionOnly = false, onOpen, onStatus }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(24);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const results = useMemo(() => {
    const filtered = families.filter(family => {
      const status = collection[family.documentId];
      if (collectionOnly && !status) return false;
      if (filter !== 'all' && status !== filter) return false;
      return `${family.title} ${family.description} ${artworkNames(family).join(' ')} ${japanese[family.documentId] || ''}`.toLocaleLowerCase().includes(deferredQuery);
    });
    return filtered.sort((a, b) => {
      if (sort === 'a-z') return familyName(a).localeCompare(familyName(b));
      if (sort === 'recent') return b.e_published_at - a.e_published_at;
      const ai = catalogueOrder.indexOf(familyName(a));
      const bi = catalogueOrder.indexOf(familyName(b));
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || familyName(a).localeCompare(familyName(b));
    });
  }, [families, japanese, collection, collectionOnly, filter, sort, deferredQuery]);

  return <section className="catalogue-section page-width" id="catalogue-grid" aria-labelledby="catalogue-heading">
    <div className="section-heading"><h2 id="catalogue-heading">{collectionOnly ? 'Saved families' : 'All Jinies'}<span className="heading-count">{results.length}</span></h2>{!collectionOnly && <span className="section-note">Browse by family</span>}</div>
    <div className="catalogue-toolbar">
      <label className="search-box"><Search size={20} /><span className="sr-only">Search Jinies</span><input aria-label="Search Jinies" value={query} onChange={event => { setQuery(event.target.value); setLimit(24); }} placeholder="Search Jinies…" type="search" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}<kbd aria-hidden="true">⌕</kbd></label>
      <div className="filter-tabs" aria-label="Collection filter">{[['all', 'All'], ['collected', 'Collected'], ['wanted', 'Wishlist']].map(([value, label]) => <button key={value} onClick={() => { setFilter(value); setLimit(24); }} className={filter === value ? 'active' : ''} aria-pressed={filter === value}>{label}</button>)}</div>
      <label className="sort-control"><SlidersHorizontal size={16} /><span className="sr-only">Sort families</span><select value={sort} onChange={event => { setSort(event.target.value); setLimit(24); }}><option value="featured">Featured</option><option value="a-z">Name A–Z</option><option value="recent">Recently added</option></select></label>
    </div>
    <div aria-live="polite" className="sr-only">{results.length} families found.</div>
    {results.length ? <div className="jini-grid">{results.slice(0, limit).map(family => {
      const name = familyName(family);
      const status = collection[family.documentId];
      const colour = tileColours[family.documentId.charCodeAt(0) % tileColours.length];
      return <article className={`jini-card ${status === 'collected' ? 'is-collected' : ''}`} key={family.documentId} style={{ '--tile': colour, '--card-tilt': `${(family.documentId.charCodeAt(0) % 5 - 2) * .45}deg` } as CSSProperties}>
        <div className="card-art-area">{status === "collected" && <span className="caught-stamp"><PawPrint size={12} />Collected</span>}
          <span className="card-art-circle" aria-hidden="true" />
          <button className="card-open" aria-label={`View ${name} family`} onClick={() => onOpen(family.documentId)}><Artwork key={family.coverImage?.[0]} url={family.coverImage?.[0]} name={name} /><span className="card-open-arrow"><ArrowUpRight size={20} /></span></button>
          <motion.button className={`collect-toggle ${status === 'collected' ? 'active' : ''}`} whileTap={{ scale: 0.85 }} onClick={() => onStatus(family.documentId, 'collected')} aria-label={`${status === 'collected' ? 'Remove' : 'Mark'} ${name} ${status === 'collected' ? 'from collection' : 'as collected'}`} aria-pressed={status === 'collected'}>{status === 'collected' ? <Check size={17} strokeWidth={3} /> : <span className="collect-plus">+</span>}</motion.button>
        </div>
        <div className="card-caption"><div><button className="card-name" onClick={() => onOpen(family.documentId)}>{name}</button><span className="card-family-label">{status === 'collected' ? 'Collected' : `${artworkNames(family).length} artwork${artworkNames(family).length === 1 ? '' : 's'}`}</span></div><button className={`wishlist-toggle ${status === 'wanted' ? 'active' : ''}`} aria-label={`${status === 'wanted' ? 'Remove' : 'Add'} ${name} ${status === 'wanted' ? 'from' : 'to'} wishlist`} aria-pressed={status === 'wanted'} onClick={() => onStatus(family.documentId, 'wanted')}><Bookmark size={20} fill={status === 'wanted' ? 'currentColor' : 'none'} /></button></div>
      </article>;
    })}</div> : <div className="empty-state"><span className="empty-icon">{query ? <Search size={35} /> : <Bookmark size={35} />}</span><h3>{query ? 'No Jinies found' : collectionOnly ? 'Your collection is empty' : 'No families saved here yet'}</h3><p>{query ? 'Try an English or Japanese name, including a family member.' : 'Use + to mark a family as collected, or the bookmark to save it to your wishlist.'}</p>{query && <button className="button button-ink" onClick={() => setQuery('')}>Clear search</button>}{filter !== 'all' && <button className="text-button" onClick={() => setFilter('all')}>Show all families</button>}</div>}
    {results.length > limit && <div className="load-more"><button className="button button-outline" onClick={() => setLimit(value => value + 24)}>Show more Jinies <ArrowDown size={17} /></button><span>{Math.min(limit, results.length)} of {results.length} families</span></div>}
  </section>;
}
