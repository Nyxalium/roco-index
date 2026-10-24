import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from 'lucide-react';
import Artwork from './Artwork';
import { bundleKindLabels, bundleKinds, zipSize } from './bundles';
import type { ArtworkBundle, BundleFile, BundleKind } from './bundles';

export function BundleGallery({ bundle, selected, onSelect, name }: { bundle: ArtworkBundle; selected: BundleFile; onSelect: (file: BundleFile) => void; name: string }) {
  const strip = useRef<HTMLDivElement>(null);
  const siblings = bundle.files.filter(file => file.kind === selected.kind);
  const index = siblings.findIndex(file => file.id === selected.id);
  const move = (direction: number) => onSelect(siblings[(index + direction + siblings.length) % siblings.length]);
  useEffect(() => {
    const container = strip.current;
    const button = container?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!container || !button) return;
    container.scrollTo({ left: button.offsetLeft - container.clientWidth / 2 + button.clientWidth / 2, behavior: 'instant' });
  }, [selected.id]);
  return <div className="bundle-gallery" role="group" aria-label={`${name} artwork gallery`} onKeyDown={event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
    if ((event.target as HTMLElement).closest('.bundle-thumbnail-strip')) requestAnimationFrame(() => strip.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true }));
  }}>
    <div className={`bundle-stage bundle-stage-${selected.kind}`}>
      <div className="bundle-stage-orbit" aria-hidden="true" />
      <span className="bundle-stage-type">{bundleKindLabels[selected.kind]} <span>{index + 1} / {siblings.length}</span></span>
      <Artwork key={selected.url} url={selected.url} name={`${selected.label} — ${selected.kind === 'artwork' ? 'official artwork' : selected.kind}`} eager />
      {siblings.length > 1 && <><button className="bundle-arrow bundle-previous circle-button" aria-label={`Previous ${selected.kind.replace('-', ' ')}`} onClick={() => move(-1)}><ChevronLeft size={20} /></button><button className="bundle-arrow bundle-next circle-button" aria-label={`Next ${selected.kind.replace('-', ' ')}`} onClick={() => move(1)}><ChevronRight size={20} /></button></>}
    </div>
    <div className="bundle-selected-label" aria-live="polite"><strong>{selected.label}</strong><span>{selected.width} × {selected.height} · {selected.filename.split('.').at(-1)?.toUpperCase()}</span></div>
    {siblings.length > 1 && <div className="bundle-thumbnail-strip" ref={strip} role="group" aria-label={`Choose ${selected.kind.replace('-', ' ')} image`}>{siblings.map(file => <button key={file.id} aria-label={`Show ${file.label}`} aria-pressed={file.id === selected.id} title={file.label} onClick={() => onSelect(file)}><Artwork url={file.thumbnail} name="" /></button>)}</div>}
  </div>;
}

export function BundleContents({ bundle, selected, onSelect }: { bundle: ArtworkBundle; selected: BundleFile; onSelect: (file: BundleFile) => void }) {
  const contents = useRef<HTMLElement>(null);
  const [kind, setKind] = useState<BundleKind | 'all'>('all');
  const [limit, setLimit] = useState(8);
  const results = bundle.files.filter(file => kind === 'all' || file.kind === kind);
  const preview = (file: BundleFile) => {
    onSelect(file);
    if (!matchMedia('(max-width: 767px)').matches) return;
    requestAnimationFrame(() => {
      const gallery = contents.current?.closest('.inline-artwork-bundle, .family-dialog')?.querySelector('.bundle-gallery');
      const dialog = contents.current?.closest('dialog');
      if (!gallery || !dialog) return;
      dialog.scrollTo({ top: Math.max(0, dialog.scrollTop + gallery.getBoundingClientRect().top - dialog.getBoundingClientRect().top - 20), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  };
  return <section ref={contents} className="included-art bundle-contents" aria-label="Art pack contents">
    <div className="bundle-contents-heading"><h3>Inside this pack <span>{bundle.files.length} files</span></h3><ImageIcon size={16} /></div>
    <div className="bundle-kind-tabs" role="group" aria-label="Filter bundle files"><button aria-pressed={kind === 'all'} onClick={() => { setKind('all'); setLimit(8); }}>All <span>{bundle.files.length}</span></button>{bundleKinds.filter(value => bundle.files.some(file => file.kind === value)).map(value => <button key={value} aria-pressed={kind === value} onClick={() => { setKind(value); setLimit(8); onSelect(bundle.files.find(file => file.kind === value)!); }}>{bundleKindLabels[value]} <span>{bundle.files.filter(file => file.kind === value).length}</span></button>)}</div>
    <div className="bundle-file-grid">{results.slice(0, limit).map(file => <button key={file.id} className={selected.id === file.id ? 'selected' : ''} aria-label={`Preview ${file.filename}`} aria-pressed={selected.id === file.id} onClick={() => preview(file)}><span><Artwork url={file.thumbnail} name="" /></span><strong>{file.label}</strong><small>{file.kind === 'artwork' ? 'Artwork' : file.kind === 'icon' ? 'Icon' : file.kind === 'egg' ? 'Jini egg' : file.kind === 'fruit' ? 'Jini fruit' : file.kind === 'chromatic-egg' ? 'Chromatic egg' : 'Image'}</small></button>)}</div>
    {results.length > limit && <button className="text-button bundle-more" onClick={() => setLimit(limit + 8)}>Show more files <span>({results.length - limit} remaining)</span><ArrowDown size={14} /></button>}
    <p className="bundle-preview-note">Previews use smaller WebP files. The ZIP contains the original images.</p>
    <details className="bundle-file-details"><summary>Selected file details</summary><dl><div><dt>Filename</dt><dd>{selected.filename}</dd></div><div><dt>Original size</dt><dd>{selected.width} × {selected.height}</dd></div></dl><a href={selected.url} target="_blank" rel="noopener noreferrer">Open preview <ArrowUpRight size={12} /></a></details>
  </section>;
}

export function InlineArtworkBundle({ bundle, name, onFamily }: { bundle: ArtworkBundle; name: string; onFamily: () => void }) {
  const [selectedId, setSelectedId] = useState(bundle.coverId);
  const selected = bundle.files.find(file => file.id === selectedId)!;
  return <div className="inline-artwork-bundle"><div className="inline-bundle-heading"><h3>{name} · global art family</h3><p>Family artwork labels are supplied by the official Asset Library.</p></div><BundleGallery bundle={bundle} name={name} selected={selected} onSelect={file => setSelectedId(file.id)} /><BundleContents bundle={bundle} selected={selected} onSelect={file => setSelectedId(file.id)} /><a className="button button-outline inline-bundle-download" href={bundle.zipUrl} target="_blank" rel="noopener noreferrer"><Download size={15} />Download art pack <span>{zipSize(bundle.zipBytes)}</span></a><button className="text-button" onClick={onFamily}>Open full art family <ArrowUpRight size={14} /></button></div>;
}
