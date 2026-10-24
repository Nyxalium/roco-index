import { useState } from 'react';
import { ArrowUpRight, Bookmark, Check, Download, Ruler, Weight } from 'lucide-react';
import Artwork from './Artwork';
import Modal from './Modal';
import { BundleContents, BundleGallery } from './ArtworkBundle';
import { bundleFor, zipSize } from './bundles';
import { creatures } from './compendium';
import { artworkNames, familyName, profileFor } from './data';
import type { Asset } from './data';
import type { CollectionStatus } from './collection';

export default function FamilyDialog({ family, japaneseTitle, status, onStatus, onClose, onCreature }: { family: Asset; japaneseTitle?: string; status?: CollectionStatus; onStatus: (status: CollectionStatus) => void; onClose: () => void; onCreature: (id: string) => void }) {
  const name = familyName(family);
  const profile = profileFor(family);
  const bundle = bundleFor(family);
  const [selectedId, setSelectedId] = useState(bundle?.coverId);
  const selected = bundle?.files.find(file => file.id === selectedId) || bundle?.files.find(file => file.id === bundle.coverId);
  const members = artworkNames(family);
  const matchedCreature = creatures.find(creature => creature.alias === name);
  return <Modal className={`family-dialog ${bundle ? 'has-bundle' : ''}`} labelledBy="family-name" onClose={onClose} closeLabel="Close family">
    {bundle && selected ? <div className="family-art family-bundle-art"><BundleGallery bundle={bundle} selected={selected} onSelect={file => setSelectedId(file.id)} name={name} /></div> : <div className="family-art"><div className="family-art-disc" /><span className="family-art-name" aria-hidden="true">{name}</span><Artwork key={family.coverImage?.[0]} url={family.coverImage?.[0]} name={name} eager />{profile && <span className="type-label">{profile.type}</span>}</div>}
    <div className="family-information"><div className="family-overline">Official art family</div><h2 id="family-name">{name}</h2>{japaneseTitle && <p className="japanese-name" lang="ja">{japaneseTitle.replace(/_進化ルート$/, '')}</p>}
      {profile && <><p className="family-description">{profile.desc}</p><div className="physical-details"><div><Ruler size={18} /><span>Height<strong>{profile.height}</strong></span></div><div><Weight size={18} /><span>Weight<strong>{profile.weight}</strong></span></div></div></>}
      <div className="family-actions"><button className={`button ${status === 'collected' ? 'button-purple' : 'button-ink'}`} onClick={() => onStatus('collected')} aria-pressed={status === 'collected'}><Check size={18} />{status === 'collected' ? 'Collected' : 'Mark as collected'}</button><button className={`button button-outline ${status === 'wanted' ? 'wanted' : ''}`} onClick={() => onStatus('wanted')} aria-pressed={status === 'wanted'}><Bookmark size={17} fill={status === 'wanted' ? 'currentColor' : 'none'} />{status === 'wanted' ? 'On wishlist' : 'Wishlist'}</button></div>
      {bundle && selected ? <BundleContents bundle={bundle} selected={selected} onSelect={file => setSelectedId(file.id)} /> : <div className="included-art"><h3>Listed artwork <span>{members.length}</span></h3><div className="member-list">{members.map(member => <span key={member}>{member}</span>)}</div><p className="bundle-unavailable">A preview has not been prepared for this version of the pack. The official ZIP is available below.</p></div>}
      {family.animations?.[0] && <a className="download-pack" href={family.animations[0]} target="_blank" rel="noopener noreferrer"><span className="download-icon"><Download size={22} /></span><span><strong>Download official art pack</strong><small>{bundle ? `${bundle.files.length} original images · ${zipSize(bundle.zipBytes)} ZIP` : 'Official ZIP bundle'}</small></span><ArrowUpRight size={20} /></a>}
      {matchedCreature && <button className="text-button family-compendium-link" onClick={() => onCreature(matchedCreature.id)}>Open {name} CN record <ArrowUpRight size={15} /></button>}<a className="family-source" href="https://rocokingdom.com/creator/images.html?lang=en" target="_blank" rel="noopener noreferrer">Official Asset Library <ArrowUpRight size={13} /></a>
    </div>
  </Modal>;
}
