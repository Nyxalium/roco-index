import { useState } from 'react';
import { ArrowUpRight, Download, Film, Maximize2, Monitor, Smartphone, Smile } from 'lucide-react';
import Artwork from './Artwork';
import MusicPlaylist from './MusicPlaylist';
import WallpaperLightbox from './WallpaperLightbox';
import { downloadUrl } from './data';
import type { Asset } from './data';
import wallpaperDimensions from './data/wallpaper-dimensions.json';

const dimensions = wallpaperDimensions as Record<string, { width: number; height: number }>;
const wallpaperFormat = (asset: Asset) => {
  const size = dimensions[asset.coverImage?.[0] || ''];
  return size ? size.width >= size.height ? 'Desktop' : 'Mobile' : 'Other wallpapers';
};

export default function Resources({ assets }: { assets: Asset[] }) {
  const [type, setType] = useState('1');
  const [format, setFormat] = useState('All');
  const [wallpaper, setWallpaper] = useState<Asset | null>(null);
  const filtered = assets.filter(asset => asset.fileType === type);
  const groups = type === '1'
    ? ['Desktop', 'Mobile', 'Other wallpapers'].map(label => ({ label, items: filtered.filter(asset => wallpaperFormat(asset) === label) })).filter(group => group.items.length && (format === 'All' || format === group.label))
    : [{ label: '', items: filtered }];

  return <section className="resources-section page-width">
    <div className="resource-tabs filter-tabs" aria-label="Resource category">{[['1', 'Wallpapers'], ['3', 'Music'], ['2', 'Videos'], ['5', 'Stickers']].map(([value, label]) => <button key={value} className={value === type ? 'active' : ''} aria-pressed={value === type} onClick={() => setType(value)}>{label}</button>)}</div>
    {type === '3' ? <MusicPlaylist /> : <>
      {type === '1' && <div className="wallpaper-format-tabs" role="group" aria-label="Wallpaper format">{['All', 'Desktop', 'Mobile'].map(label => <button key={label} aria-pressed={format === label} onClick={() => setFormat(label)}>{label === 'Desktop' && <Monitor size={15} />}{label === 'Mobile' && <Smartphone size={15} />}{label}</button>)}</div>}
      {groups.map(group => <section className={`wallpaper-group ${group.label === 'Mobile' ? 'wallpaper-group-mobile' : ''}`} key={group.label} aria-label={group.label || undefined}>
        {group.label && <div className="wallpaper-section-heading"><h2>{group.label}</h2><span>{group.label === 'Desktop' ? 'Landscape · ' : group.label === 'Mobile' ? 'Portrait · ' : ''}{group.items.length}</span></div>}
        <div className="resources-grid">{group.items.map(asset => {
          const size = dimensions[asset.coverImage?.[0] || ''];
          return <article className="resource-card" key={asset.documentId}>
            {type === '1' ? <button className="resource-art wallpaper-open" aria-label={`Preview ${asset.title}`} aria-haspopup="dialog" onClick={() => setWallpaper(asset)}><Artwork key={asset.coverImage?.[0]} url={asset.coverImage?.[0]} name={asset.title} /><span className="wallpaper-expand" aria-hidden="true"><Maximize2 size={17} /></span></button> : <div className="resource-art"><Artwork key={asset.coverImage?.[0]} url={asset.coverImage?.[0]} name={asset.title} />{type === '2' && <span className="resource-media-icon"><Film size={24} /></span>}{type === '5' && <span className="resource-media-icon"><Smile size={24} /></span>}</div>}
            <div className="resource-caption"><div><h3>{asset.title.replace(/^Jini Wallpaper - /, '')}</h3><span>{type === '1' ? size ? `${size.width.toLocaleString()} × ${size.height.toLocaleString()}` : 'Official wallpaper' : type === '2' ? 'Official video' : 'Sticker pack'}</span></div>{downloadUrl(asset) && <a className="circle-button" href={downloadUrl(asset)} target="_blank" rel="noopener noreferrer" aria-label={`${type === '1' ? 'Download' : 'Open'} ${asset.title}`}>{type === '2' ? <ArrowUpRight size={19} /> : <Download size={18} />}</a>}</div>
          </article>;
        })}</div>
      </section>)}
      <p className="resource-source">Assets link to the official Creator Asset Library. <a href="https://rocokingdom.com/creator/index.html?lang=en" target="_blank" rel="noopener noreferrer">Creator information <ArrowUpRight size={13} /></a></p>
    </>}
    {wallpaper && <WallpaperLightbox wallpapers={assets.filter(asset => asset.fileType === '1' && wallpaperFormat(asset) === wallpaperFormat(wallpaper))} initial={wallpaper} onClose={() => setWallpaper(null)} />}
  </section>;
}
