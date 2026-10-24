import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const preferenceKey = 'roco-index:ui-audio:v1';

export default function UiSounds({ onSaveError }: { onSaveError: () => void }) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(preferenceKey) !== 'off'; } catch { return true; }
  });
  const [available, setAvailable] = useState(true);
  const clips = useRef<(HTMLAudioElement | null)[]>([]);
  useEffect(() => {
    if (!enabled || !available) return;
    const sounds = clips.current.filter((audio): audio is HTMLAudioElement => Boolean(audio));
    sounds.forEach(audio => {
      audio.volume = .22;
      audio.onerror = () => setAvailable(false);
    });
    let lastPlayed = 0;
    const activate = (event: MouseEvent) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const control = event.target.closest<HTMLButtonElement | HTMLAnchorElement>('button,a');
      if (!control || control.closest('[data-ui-sound="off"]') || control.matches(':disabled,[aria-disabled="true"]')) return;
      // Keep interface feedback out of music playback and continuous controls.
      const music = document.querySelector<HTMLAudioElement>('audio[data-music-player]');
      if (music && !music.paused) return;
      const now = performance.now();
      if (now - lastPlayed < 80) return;
      lastPlayed = now;
      const clip = sounds[control.getAttribute('aria-pressed') === 'true' ? 1 : 0];
      sounds.forEach(audio => audio.pause());
      clip.currentTime = 0;
      void clip.play().catch((error: DOMException) => {
        if (error.name === 'NotAllowedError' || error.name === 'AbortError') return;
        console.warn('Interface audio could not play.', error);
        setAvailable(false);
      });
    };
    document.addEventListener('click', activate);
    return () => {
      document.removeEventListener('click', activate);
      sounds.forEach(audio => { audio.pause(); audio.onerror = null; });
    };
  }, [enabled, available]);
  return <><button className="sound-toggle" type="button" data-ui-sound="off" aria-label={available ? enabled ? 'Mute interface sounds' : 'Enable interface sounds' : 'Interface sounds unavailable'} aria-pressed={enabled && available} title={available ? enabled ? 'Interface sounds on' : 'Interface sounds off' : 'Interface audio could not load. Reload to retry.'} disabled={!available} onClick={() => {
    const next = !enabled;
    if (!next) clips.current.forEach(audio => audio?.pause());
    setEnabled(next);
    try { localStorage.setItem(preferenceKey, next ? 'on' : 'off'); } catch { onSaveError(); }
  }}>{enabled && available ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>{['click', 'select'].map((name, index) => <audio key={name} ref={element => { clips.current[index] = element; }} hidden data-ui-audio={name} src={`/ui-audio/${name}.mp3`} preload="none" />)}</>;
}
