import { compendium, creatureById } from './compendium';

export type CreatureStatus = 'caught' | 'seen' | 'wanted';
export interface TeamMember { creatureId: string; skills: (string | null)[] }
export interface Team { id: string; name: string; members: TeamMember[] }
export interface Workspace {
  version: 1; dataset: string;
  tracking: Record<string, { status?: CreatureStatus; note?: string }>;
  teams: Team[]; activeTeam: string | null;
}
export const workspaceKey = 'roco-index:workspace:v1';
export const newTeamId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
export function emptyWorkspace(): Workspace {
  return { version: 1, dataset: compendium.source.sha256, tracking: {}, teams: [], activeTeam: null };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
export function parseTeam(value: unknown): Team {
  if (!isRecord(value) || typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(value.id) || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 60 || !Array.isArray(value.members) || value.members.length > 6) throw new Error('A team needs a name and at most six creatures.');
  const members = value.members.map(member => {
    if (!isRecord(member) || typeof member.creatureId !== 'string' || !creatureById.has(member.creatureId)) throw new Error('The team contains a creature missing from this snapshot.');
    const creature = creatureById.get(member.creatureId)!;
    if (!Array.isArray(member.skills) || member.skills.length > 4 || new Set(member.skills.filter(id => id !== null)).size !== member.skills.filter(id => id !== null).length || member.skills.some(id => id !== null && (typeof id !== 'string' || !creature.learnset.some(entry => entry.id === id)))) throw new Error('Each creature can carry up to four distinct skills from its learnset.');
    return { creatureId: member.creatureId, skills: member.skills as (string | null)[] };
  });
  return { id: value.id, name: value.name.trim(), members };
}
export function parseWorkspace(value: unknown): Workspace {
  if (!isRecord(value) || value.version !== 1 || typeof value.dataset !== 'string' || value.dataset !== compendium.source.sha256) throw new Error('This workspace uses a different or unsupported data snapshot. Keep the backup; automatic conversion is unavailable.');
  if (!isRecord(value.tracking) || !Array.isArray(value.teams) || value.teams.length > 20) throw new Error('Invalid workspace backup. A workspace supports up to 20 teams.');
  const tracking: Workspace['tracking'] = {};
  for (const [id, record] of Object.entries(value.tracking)) {
    if (!creatureById.has(id) || !isRecord(record) || (record.status !== undefined && !['caught', 'seen', 'wanted'].includes(String(record.status))) || (record.note !== undefined && (typeof record.note !== 'string' || record.note.length > 2000))) throw new Error('The backup has an unknown creature, collection status, or invalid note.');
    tracking[id] = { status: record.status as CreatureStatus | undefined, note: record.note as string | undefined };
  }
  const teams = value.teams.map(parseTeam);
  if (new Set(teams.map(team => team.id)).size !== teams.length || (value.activeTeam !== null && !teams.some(team => team.id === value.activeTeam))) throw new Error('The backup has duplicate team IDs or an unknown active team.');
  return { version: 1, dataset: value.dataset, tracking, teams, activeTeam: value.activeTeam as string | null };
}
export function loadWorkspace(): { workspace: Workspace; error: string | null } {
  try {
    const text = localStorage.getItem(workspaceKey);
    return { workspace: text ? parseWorkspace(JSON.parse(text)) : emptyWorkspace(), error: null };
  } catch (error) {
    return { workspace: emptyWorkspace(), error: `Saved companion data could not be loaded. ${error instanceof Error ? error.message : 'Browser storage is unavailable.'} The stored data has not been removed.` };
  }
}
export function encodeTeam(team: Team) {
  const payload = JSON.stringify({ version: 1, dataset: compendium.source.sha256, team: parseTeam(team) });
  return btoa(String.fromCharCode(...new TextEncoder().encode(payload))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeTeam(code: string): Team {
  if (!/^[a-zA-Z0-9_-]{1,16000}$/.test(code)) throw new Error('Choose a valid Roco Index team code under 16,000 characters.');
  let value: unknown;
  try { value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(code.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0)))); }
  catch { throw new Error('The team code is incomplete or not valid JSON.'); }
  if (!isRecord(value) || value.version !== 1 || value.dataset !== compendium.source.sha256) throw new Error('This team uses a different or unsupported data snapshot.');
  return parseTeam(value.team);
}
