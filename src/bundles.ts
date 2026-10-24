import bundleData from './data/artwork-bundles.json';
import type { Asset } from './data';

export type BundleKind = 'artwork' | 'icon' | 'egg' | 'fruit' | 'chromatic-egg' | 'other';
export interface BundleFile {
  id: string;
  filename: string;
  label: string;
  kind: BundleKind;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
}
export interface ArtworkBundle {
  zipUrl: string;
  zipBytes: number;
  zipSha256: string;
  coverId: string;
  files: BundleFile[];
}
const bundles = bundleData as unknown as Record<string, ArtworkBundle>;
export const bundleKindLabels: Record<BundleKind, string> = { artwork: 'Artwork', icon: 'Icons', egg: 'Eggs', fruit: 'Fruit', 'chromatic-egg': 'Chromatic eggs', other: 'Other images' };
export const bundleKinds: BundleKind[] = ['artwork', 'icon', 'egg', 'fruit', 'chromatic-egg', 'other'];
export const zipSize = (bytes: number) => bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;

export function bundleFor(family?: Asset): ArtworkBundle | undefined {
  const bundle = family && bundles[family.documentId];
  // A refreshed feed can point to a different pack. Keep previews tied to the captured ZIP.
  return bundle?.zipUrl === family?.animations?.[0] ? bundle : undefined;
}

export function representativeAsset(family: Asset | undefined, kind: BundleKind) {
  const bundle = bundleFor(family);
  const cover = bundle?.files.find(file => file.id === bundle.coverId);
  return cover && bundle?.files.find(file => file.kind === kind && file.label === cover.label);
}
