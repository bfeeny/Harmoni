import { useState } from 'react';
import { Sound } from '../utils/types';
import { audioService } from '../services/AudioService';

interface SoundCardProps {
  sound: Sound;
  isPlaying: boolean;
  volume: number;
  onPlay: (id: string) => void;
  onStop: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
}

export default function SoundCard({
  sound,
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange,
}: SoundCardProps) {
  const handleTogglePlay = () => {
    if (isPlaying) {
      onStop(sound.id);
    } else {
      onPlay(sound.id);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(sound.id, newVolume);
  };

  return (
    <div className="sound-card">
      <div className="sound-card-header">
        <h3>{sound.name}</h3>
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Stop sound' : 'Play sound'}
        >
          {isPlaying ? '■' : '▶'}
        </button>
      </div>
      
      <p className="sound-description">{sound.description}</p>
      
      <div className="volume-control">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          disabled={!isPlaying}
          aria-label="Volume control"
        />
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}