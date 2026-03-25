import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'MEM_CORRUPTION_0x01', artist: 'UNKNOWN_ENTITY', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'BUFFER_OVERFLOW', artist: 'NULL_PTR', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'KERNEL_PANIC', artist: 'ROOT_ACCESS', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play error:", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="bg-dark-surface border-2 border-neon-cyan p-6 w-full max-w-md mx-auto flex flex-col gap-4 screen-tear relative overflow-hidden">
      {/* Glitch overlay line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-neon-magenta opacity-50 animate-pulse"></div>
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-black border-2 border-neon-magenta flex items-center justify-center shrink-0 screen-tear">
          <Terminal className="text-neon-cyan w-8 h-8" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-neon-magenta font-pixel text-xs truncate uppercase glitch" data-text={currentTrack.title}>{currentTrack.title}</h3>
          <p className="text-neon-cyan font-terminal text-xl truncate mt-1">SRC: {currentTrack.artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex items-center gap-2 mt-2">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleSeek}
          className="w-full h-2 bg-black border border-neon-cyan rounded-none appearance-none cursor-pointer accent-neon-magenta"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className="text-neon-cyan hover:text-neon-magenta transition-colors">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume} 
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-20 h-2 bg-black border border-neon-cyan rounded-none appearance-none cursor-pointer accent-neon-cyan"
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={prevTrack} className="text-neon-cyan hover:text-neon-magenta transition-colors">
            <SkipBack size={28} />
          </button>
          <button 
            onClick={togglePlay} 
            className="w-14 h-14 flex items-center justify-center bg-black border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black transition-colors"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={nextTrack} className="text-neon-cyan hover:text-neon-magenta transition-colors">
            <SkipForward size={28} />
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />
    </div>
  );
}
