import { useEffect, useRef, useState } from 'react';
import { creatureById, creatureName } from './compendium';
import { emptyWorkspace, loadWorkspace, newTeamId, parseTeam, parseWorkspace, workspaceKey } from './workspace';
import type { CreatureStatus, Team, Workspace } from './workspace';

export default function useWorkspace(notify: (notice: { text: string; error?: boolean }) => void) {
  const [loaded] = useState(loadWorkspace);
  const [workspace, setWorkspace] = useState(loaded.workspace);
  const [readError, setReadError] = useState(loaded.error);
  const current = useRef(workspace);
  const reload = () => {
    const next = loadWorkspace(); current.current = next.workspace;
    setWorkspace(next.workspace); setReadError(next.error);
    return next;
  };
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== workspaceKey) return;
      const next = loadWorkspace(); current.current = next.workspace;
      setWorkspace(next.workspace); setReadError(next.error);
      if (next.error) notify({ text: next.error, error: true });
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [notify]);
  const save = (next: Workspace, allowRecovery = false) => {
    if (readError && !allowRecovery) { notify({ text: 'Your stored companion data could not be read. Download it or reset it from Collection before saving changes.', error: true }); return false; }
    const valid = parseWorkspace(next);
    try {
      localStorage.setItem(workspaceKey, JSON.stringify(valid));
      current.current = valid; setWorkspace(valid);
      if (allowRecovery) setReadError(null);
      return true;
    } catch { notify({ text: 'Browser storage failed. This change was not applied. Export a backup from Collection and free browser storage before trying again.', error: true }); return false; }
  };
  const setStatus = (id: string, status: CreatureStatus) => {
    if (!creatureById.has(id)) return;
    const next = { ...current.current, tracking: { ...current.current.tracking } };
    const old = next.tracking[id] || {};
    const toggled = old.status === status ? undefined : status;
    if (!toggled && !old.note) delete next.tracking[id]; else next.tracking[id] = { ...old, status: toggled };
    save(next);
  };
  const setNote = (id: string, note: string) => {
    const next = { ...current.current, tracking: { ...current.current.tracking } };
    next.tracking[id] = { ...next.tracking[id], note: note.trim() || undefined };
    if (!next.tracking[id].status && !next.tracking[id].note) delete next.tracking[id];
    save(next);
  };
  const newTeam = (name?: string) => {
    if (current.current.teams.length >= 20) { notify({ text: 'This workspace already has 20 teams. Export or remove one before adding another.', error: true }); return null; }
    const team: Team = { id: newTeamId(), name: name || `Team ${current.current.teams.length + 1}`, members: [] };
    return save({ ...current.current, teams: [...current.current.teams, team], activeTeam: team.id }) ? team : null;
  };
  const updateTeam = (team: Team) => save({ ...current.current, teams: current.current.teams.map(old => old.id === team.id ? parseTeam(team) : old) });
  const addToTeam = (creatureId: string) => {
    const creature = creatureById.get(creatureId);
    if (!creature) return false;
    let team = current.current.teams.find(item => item.id === current.current.activeTeam);
    if (!team) team = newTeam() || undefined;
    if (!team) return false;
    if (team.members.length >= 6) { notify({ text: `${team.name} already has six members. Remove one in Team lab before adding another.`, error: true }); return false; }
    if (updateTeam({ ...team, members: [...team.members, { creatureId, skills: [] }] })) { notify({ text: `${creatureName(creature)} added to ${team.name}.` }); return true; }
    return false;
  };
  const importTeam = (value: Team) => {
    if (current.current.teams.length >= 20) { notify({ text: 'Remove a saved team before importing another. The limit is 20 teams.', error: true }); return false; }
    const team = { ...parseTeam(value), id: newTeamId() };
    return save({ ...current.current, teams: [...current.current.teams, team], activeTeam: team.id });
  };
  return { workspace, readError, reload, save, setStatus, setNote, newTeam, updateTeam, addToTeam, importTeam,
    selectTeam: (id: string) => save({ ...current.current, activeTeam: id }),
    deleteTeam: (id: string) => {
      const teams = current.current.teams.filter(team => team.id !== id);
      save({ ...current.current, teams, activeTeam: current.current.activeTeam === id ? teams[0]?.id || null : current.current.activeTeam });
    },
    recover: () => save(emptyWorkspace(), true),
  };
}
export type CompanionState = ReturnType<typeof useWorkspace>;
