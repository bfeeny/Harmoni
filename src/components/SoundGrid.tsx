import { useState, useEffect } from 'react';
import SoundCard from './SoundCard';
import { Sound, SoundCategory } from '../utils/types';

interface SoundGridProps {
  sounds: Sound[];
  category?: SoundCategory; // Optional category filter
}

interface SoundState {
  [key: string]: {
    isPlaying: boolean;
    volume: number;
  };
}

export default function SoundGrid({ sounds, category }: SoundGridProps) {
  // Filter sounds by category if provided
  const filteredSounds = category
    ? sounds.filter(sound => sound.category === category)
    : sounds;
    
  // Maintain state for all sounds
  const [soundStates, setSoundStates] = useState<SoundState>({});
  
  // Initialize sound states
  useEffect(() => {
    const initialStates: SoundState = {};
    filteredSounds.forEach(sound => {
      initialStates[sound.id] = {
        isPlaying: false,
        volume: 0.5,
      };
    });
    setSoundStates(initialStates);
  }, [filteredSounds]);
  
  // Handle play button click
  const handlePlay = (id: string) => {
    setSoundStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isPlaying: true,
      },
    }));
  };
  
  // Handle stop button click
  const handleStop = (id: string) => {
    setSoundStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isPlaying: false,
      },
    }));
  };
  
  // Handle volume change
  const handleVolumeChange = (id: string, volume: number) => {
    setSoundStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        volume,
      },
    }));
  };
  
  return (
    <div className="sound-grid">
      {filteredSounds.map(sound => (
        <SoundCard
          key={sound.id}
          sound={sound}
          isPlaying={soundStates[sound.id]?.isPlaying || false}
          volume={soundStates[sound.id]?.volume || 0.5}
          onPlay={handlePlay}
          onStop={handleStop}
          onVolumeChange={handleVolumeChange}
        />
      ))}
    </div>
  );
}