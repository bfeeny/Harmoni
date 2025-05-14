import { useState, useEffect } from 'react';
import { Sound } from '../utils/types';
import { soundLibrary as defaultSoundLibrary } from '../data/soundLibrary';

/**
 * Custom hook for managing the sound library, including both default
 * and custom sounds added from external sources like Freesound
 */
export function useSoundLibrary() {
  // Initialize with the default sound library
  const [soundLibrary, setSoundLibrary] = useState<Sound[]>(defaultSoundLibrary);
  const [customSounds, setCustomSounds] = useState<Sound[]>([]);
  
  // Load custom sounds from local storage on mount
  useEffect(() => {
    try {
      const savedSounds = localStorage.getItem('harmoni_custom_sounds');
      if (savedSounds) {
        const parsedSounds = JSON.parse(savedSounds) as Sound[];
        setCustomSounds(parsedSounds);
      }
    } catch (error) {
      console.error('Error loading custom sounds:', error);
    }
  }, []);
  
  // Update sound library when custom sounds change
  useEffect(() => {
    setSoundLibrary([...defaultSoundLibrary, ...customSounds]);
    
    // Save custom sounds to local storage
    try {
      localStorage.setItem('harmoni_custom_sounds', JSON.stringify(customSounds));
    } catch (error) {
      console.error('Error saving custom sounds:', error);
    }
  }, [customSounds]);
  
  /**
   * Add a new custom sound to the library
   */
  const addSound = (sound: Sound) => {
    // Check if sound with this ID already exists
    const exists = soundLibrary.some(s => s.id === sound.id);
    if (exists) {
      console.warn(`Sound with ID ${sound.id} already exists in the library`);
      return false;
    }
    
    setCustomSounds(prevSounds => [...prevSounds, sound]);
    return true;
  };
  
  /**
   * Remove a custom sound from the library
   */
  const removeSound = (id: string) => {
    // Only allow removing custom sounds, not default ones
    const isCustomSound = customSounds.some(s => s.id === id);
    if (!isCustomSound) {
      console.warn(`Cannot remove sound ${id} as it is not a custom sound`);
      return false;
    }
    
    setCustomSounds(prevSounds => prevSounds.filter(s => s.id !== id));
    return true;
  };
  
  /**
   * Get a sound by ID
   */
  const getSound = (id: string) => {
    return soundLibrary.find(s => s.id === id);
  };
  
  return {
    soundLibrary,
    customSounds,
    addSound,
    removeSound,
    getSound
  };
}