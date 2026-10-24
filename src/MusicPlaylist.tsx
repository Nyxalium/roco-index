import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDownToLine, Disc3, ExternalLink, LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useContentLanguage } from './localization';
import catalogue from './data/music-tracks.json';

const tracks = catalogue.tracks;
const timeLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function MusicPlaylist() {
  const language = useContentLanguage();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0].duration);
  const [volume, setVolume] = useState(.6);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const playRequested = useRef(false);
  const previousVolume = useRef(.6);
  const track = tracks[selected];
  const title = language === 'zh-CN' ? track.titleZh : track.title;
  const totalMinutes = Math.round(tracks.reduce((total, item) => total + item.duration, 0) / 60);
  const play = () => {
    setError('');
    setBuffering(true);
    void audio.current!.play().catch((caught: DOMException) => {
      if (caught.name === 'AbortError') return;
      setBuffering(false);
      setPlaying(false);
      setError(caught.name === 'NotAllowedError' ? 'Press play to start this track.' : 'This track could not be loaded. Retry or choose another recording.');
    });
  };
  const choose = (index: number) => {
    if (index === selected) { if (audio.current!.paused) play(); else audio.current!.pause(); return; }
    playRequested.current = true;
    setReady(false);
    setSelected(index);
    setTime(0);
    setDuration(tracks[index].duration);
    setError('');
  };
  useEffect(() => {
    if (playRequested.current) { playRequested.current = false; play(); }
  }, [selected]);
  useEffect(() => { audio.current!.volume = volume; }, [volume]);
  useEffect(() => { const element = audio.current!; return () => element.pause(); }, []);

  return <section className={`music-collection ${playing ? 'is-playing' : ''}`} aria-label="Roco Kingdom music playlist" data-ui-sound="off">
    <audio ref={audio} src={track.url} preload="none" data-music-player aria-label="Music playback" onPlay={() => setPlaying(true)} onPlaying={() => setBuffering(false)} onWaiting={() => setBuffering(true)} onPause={() => { setPlaying(false); setBuffering(false); }} onTimeUpdate={event => setTime(event.currentTarget.currentTime)} onLoadedMetadata={event => { setReady(true); if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }} onError={() => { setBuffering(false); setPlaying(false); setError('This track could not be loaded. Retry or choose another recording.'); }} onEnded={() => { if (selected < tracks.length - 1) choose(selected + 1); else setPlaying(false); }} />
    <div className="music-player">
      <div className="album-art"><div className="album-record" aria-hidden="true"><span><Disc3 size={26} /></span></div><div className="album-sleeve"><img src="/media/music-cover.webp" alt="Fan illustration of Dimo listening to records in a sunny blue room" width="900" height="900" /><span className="album-corner" aria-hidden="true"><Disc3 size={18} /></span></div></div>
      <div className="now-playing"><span className="music-eyebrow">{playing ? 'Now playing' : 'Selected track'}</span><h2 lang={language}>{title}</h2><p>{track.artist}</p><span className="music-edition">{track.edition}</span></div>
      <div className="music-timeline"><input type="range" aria-label="Track position" min="0" max={duration} step=".1" value={Math.min(time, duration)} disabled={!ready || Boolean(error)} style={{ '--progress': `${time / duration * 100}%` } as CSSProperties} onChange={event => { const value = Number(event.target.value); if (audio.current!.readyState > 0) { audio.current!.currentTime = value; setTime(value); } }} /><div><span>{timeLabel(time)}</span><span>{timeLabel(duration)}</span></div></div>
      <div className="music-controls"><button className="music-skip" aria-label="Previous track" onClick={() => choose((selected + tracks.length - 1) % tracks.length)}><SkipBack size={21} fill="currentColor" /></button><button className="music-play" aria-label={playing ? 'Pause music' : 'Play music'} onClick={() => { if (audio.current!.paused) play(); else audio.current!.pause(); }}>{buffering ? <LoaderCircle size={27} className="music-loading" /> : playing ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}</button><button className="music-skip" aria-label="Next track" onClick={() => choose((selected + 1) % tracks.length)}><SkipForward size={21} fill="currentColor" /></button></div>
      <div className="music-volume"><button aria-label={volume ? 'Mute music' : 'Unmute music'} onClick={() => { if (volume) { previousVolume.current = volume; setVolume(0); } else setVolume(previousVolume.current); }}>{volume ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><input type="range" aria-label="Music volume" min="0" max="1" step=".01" value={volume} onChange={event => { const next = Number(event.target.value); if (next) previousVolume.current = next; setVolume(next); }} /><a href={track.url} download aria-label={`Download ${title}`} title="Download this track"><ArrowDownToLine size={17} /></a></div>
      {error && <p className="music-error" role="alert">{error} <button onClick={() => { audio.current!.load(); play(); }}>Retry</button></p>}
    </div>
    <div className="music-library"><header className="music-library-heading"><div><span className="music-eyebrow">Creator music collection</span><h2>Roco Kingdom</h2><p>{tracks.length} recordings <span>·</span> {totalMinutes} minutes</p></div><Disc3 size={32} strokeWidth={1.2} /></header>
      <ol className="music-tracklist">{tracks.map((item, index) => <li key={item.assetId}><button className={index === selected ? 'selected' : ''} aria-current={index === selected ? 'true' : undefined} aria-label={`${index === selected && playing ? 'Pause' : 'Play'} ${language === 'zh-CN' ? item.titleZh : item.title}, ${item.edition}`} onClick={() => choose(index)}><span className="track-number">{index === selected && playing ? <span className="playing-bars" aria-label="Playing"><i /><i /><i /></span> : String(index + 1).padStart(2, '0')}</span><span className="track-name"><strong lang={language}>{language === 'zh-CN' ? item.titleZh : item.title}</strong><small>{item.edition}</small></span><span className="track-duration">{timeLabel(item.duration)}</span><span className="track-play" aria-hidden="true">{index === selected && playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</span></button></li>)}</ol>
      <details className="music-credits"><summary>Track credits & sources</summary><p>Music from the official Creator Asset Library. Vocal titles are translated from the released Chinese soundtrack listing and matched using source labels and duration. Unmatched instrumentals use numbered labels; these are not claimed as official song titles.</p><dl><div><dt>Selected recording</dt><dd>{track.sourceTitle}</dd></div><div><dt>Title reference</dt><dd>{track.titleStatus === 'matched-vocal-title' ? <a href={catalogue.titleReference} target="_blank" rel="noopener noreferrer">Chinese soundtrack listing <ExternalLink size={12} /></a> : 'Original source number; published title unverified'}</dd></div></dl><a href={track.sourceUrl} target="_blank" rel="noopener noreferrer">Original recording <ExternalLink size={12} /></a><a href="/music/sources.json" download>Audio source records <ArrowDownToLine size={12} /></a></details>
    </div>
  </section>;
}
