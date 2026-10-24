import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ImageOff } from 'lucide-react';
import Modal from './Modal';
import { downloadUrl } from './data';
import type { Asset } from './data';

export default function WallpaperLightbox({ wallpapers, initial, onClose }: { wallpapers: Asset[]; initial: Asset; onClose: () => void }) {
  const [index, setIndex] = useState(() => Math.max(0, wallpapers.findIndex(asset => asset.documentId === initial.documentId)));
  const [image, setImage] = useState<{ url: string; width?: number; height?: number; failed?: boolean }>();
  const [retry, setRetry] = useState(0);
  const asset = wallpapers[index];
  const url = asset.coverImage?.[0];
  const loaded = image?.url === url ? image : undefined;
  const failed = !url || loaded?.failed;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      setIndex(current => (current + (event.key === 'ArrowLeft' ? -1 : 1) + wallpapers.length) % wallpapers.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [wallpapers.length]);

  return <Modal className="wallpaper-lightbox" labelledBy="wallpaper-title" closeLabel="Close wallpaper preview" onClose={onClose}>
    <div className="wallpaper-gallery">
      <div className="wallpaper-stage" aria-busy={!failed && !loaded}>
        {failed ? <div className="wallpaper-image-status" role="alert"><ImageOff size={30} /><p>Wallpaper could not be loaded.</p>{url && <button className="button" onClick={() => { setImage(undefined); setRetry(current => current + 1); }}>Try again</button>}</div> : <>
          {!loaded && <span className="wallpaper-image-status" role="status">Loading wallpaper…</span>}
          <img key={`${url}:${retry}`} src={url} alt={asset.title} draggable={false} decoding="async" onLoad={event => setImage({ url: url!, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setImage({ url: url!, failed: true })} />
        </>}
      </div>
      <div className="wallpaper-toolbar">
        <div className="wallpaper-caption" aria-live="polite"><h2 id="wallpaper-title">{asset.title.replace(/^Jini Wallpaper - /, '')}</h2><p>Official wallpaper{loaded?.width && ` · ${loaded.width.toLocaleString()} × ${loaded.height!.toLocaleString()}`}</p></div>
        <div className="wallpaper-actions">
          <div className="wallpaper-navigation" role="group" aria-label="Browse wallpapers">
            <button className="circle-button" aria-label="Previous wallpaper" disabled={wallpapers.length < 2} onClick={() => setIndex(current => (current - 1 + wallpapers.length) % wallpapers.length)}><ChevronLeft size={20} /></button>
            <span aria-live="polite">{index + 1} / {wallpapers.length}</span>
            <button className="circle-button" aria-label="Next wallpaper" disabled={wallpapers.length < 2} onClick={() => setIndex(current => (current + 1) % wallpapers.length)}><ChevronRight size={20} /></button>
          </div>
          {downloadUrl(asset) && <a className="button wallpaper-download" href={downloadUrl(asset)} target="_blank" rel="noopener noreferrer" download><Download size={17} /><span>Download original</span></a>}
        </div>
      </div>
    </div>
  </Modal>;
}
