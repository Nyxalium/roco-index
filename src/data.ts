import assetsEn from './data/assets-en.json';
import assetsJa from './data/assets-ja.json';
import newsEn from './data/news-en.json';
import profiles from './data/profiles.json';
import artworkManifest from './artwork-manifest.json';
import { bundleFor } from './bundles';

export interface Asset {
  documentId: string;
  title: string;
  description: string;
  fileType: string;
  coverImage: string[] | null;
  animations: string[] | null;
  videos: string[] | null;
  audios: string[] | null;
  emoji_zip: string[] | string | null;
  e_published_at: number;
  columns: { uid: string | number; name: string }[];
}

export interface NewsArticle {
  documentId: string;
  title: string;
  content: string;
  description: string;
  coverImage1: string[] | null;
  set_on_status_time: number;
  columns: { name: string }[];
}

export const initialAssets = assetsEn.data as unknown as Asset[];
export const initialJapaneseAssets = assetsJa.data as unknown as Asset[];
export const initialNews = newsEn.data as unknown as NewsArticle[];
export const snapshotDate = '24 October 2026';
export const cdnBase = 'https://linkage-cdn.vasdgame.com/cms/nrcg/prod/api/v1/';

export const featuredNames = ['Dimo', 'Sparka', 'Vargyr', 'Duckiji'];
export const catalogueOrder = ['Dimo', 'Meevy', 'Sparka', 'Cerulla', 'Vargyr', 'Duckiji', 'Bellisk', 'Cubot', 'Spruckle', 'Bunniaid', 'Lopi', 'Nytty'];
export const familyName = (asset: Asset) => asset.title.replace(/ Evolution Line$/, '');
export const imageUrl = (url?: string) => url ? (artworkManifest as Record<string, string>)[url] || url : '';
export const profileFor = (asset: Asset) => profiles.find(profile => profile.name === familyName(asset));

export function artworkNames(asset: Asset): string[] {
  const bundle = bundleFor(asset);
  if (bundle) return [...new Set(bundle.files.filter(file => file.kind === 'artwork').map(file => file.label))];
  return [...new Set(asset.description.split(',').flatMap(label => {
    const match = label.trim().match(/^(.+?) Artwork$/);
    return match ? [match[1]] : [];
  }))];
}

export function downloadUrl(asset: Asset): string | undefined {
  const emoji = Array.isArray(asset.emoji_zip) ? asset.emoji_zip[0] : asset.emoji_zip;
  return asset.animations?.[0] || asset.videos?.[0] || asset.audios?.[0] || emoji || asset.coverImage?.[0];
}

export function readRoute() {
  const url = new URL(location.hash.slice(1) || '/catalogue', location.origin);
  const view = ['catalogue', 'compendium', 'skills', 'teams', 'breeding', 'locations', 'collection', 'news', 'resources', 'sources'].includes(url.pathname.slice(1)) ? url.pathname.slice(1) : 'catalogue';
  const family = url.searchParams.get('family');
  const creature = family ? null : url.searchParams.get('creature');
  const skill = family || creature ? null : url.searchParams.get('skill');
  return { view, family, creature, skill, team: view === 'teams' ? url.searchParams.get('team') : null };
}

export function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(timestamp * 1000);
}
