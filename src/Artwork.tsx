import { useState } from 'react';
import type { ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { imageUrl } from './data';

export default function Artwork({ url, name, className = '', eager = false, fallback }: { url?: string; name: string; className?: string; eager?: boolean; fallback?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return fallback ?? <div className={`artwork-error ${className}`}><ImageOff size={28} /><span>Artwork unavailable</span></div>;
  return <img className={className} src={imageUrl(url)} alt={name} draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={event => {
    if (event.currentTarget.dataset.retried !== 'true' && imageUrl(url) !== url) {
      event.currentTarget.dataset.retried = 'true';
      event.currentTarget.src = url;
    } else setFailed(true);
  }} />;
}
