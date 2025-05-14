import { useState, useEffect } from 'react';
import SoundCard from './SoundCard';
import { Sound, SoundCategory } from '../utils/types';

interface SoundGridProps {
  sounds: Sound[];
  category?: SoundCategory; // Optional category filter
  activeSounds?: Set<string>; // Active sounds from App
  soundVolumes?: Map<string, number>; // Sound volumes from App
  onPlay?: (id: string) => void; // Callback when sound is played
  onStop?: (id: string) => void; // Callback when sound is stopped
  onVolumeChange?: (id: string, volume: number) => void; // Callback when volume changes
}

export default function SoundGrid({ 
  sounds, 
  category,
  activeSounds = new Set(),
  soundVolumes = new Map(),
  onPlay = () => {},
  onStop = () => {},
  onVolumeChange = () => {}
}: SoundGridProps) {
  // Filter sounds by category if provided
  const filteredSounds = category
    ? sounds.filter(sound => sound.category === category)
    : sounds;
  
  return (
    <div className="sound-grid">
      {filteredSounds.map(sound => (
        <SoundCard
          key={sound.id}
          sound={sound}
          isPlaying={activeSounds.has(sound.id)}
          volume={soundVolumes.get(sound.id) || 0.5}
          onPlay={onPlay}
          onStop={onStop}
          onVolumeChange={onVolumeChange}
        />
      ))}
    </div>
  );
}