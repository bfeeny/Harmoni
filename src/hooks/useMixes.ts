import { useState, useEffect } from 'react';
import { SoundMix, SoundSetting } from '../utils/types';
import { mixService } from '../services/MixService';
import { extractSharedMixFromUrl } from '../utils/shareUtils';

/**
 * Custom hook for managing sound mixes
 */
export function useMixes() {
  const [mixes, setMixes] = useState<SoundMix[]>([]);
  const [activeMixId, setActiveMixId] = useState<string | null>(null);
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false);
  
  // Load mixes from storage on mount
  useEffect(() => {
    const savedMixes = mixService.getSavedMixes();
    setMixes(savedMixes);
  }, []);
  
  // Check for shared mix in URL
  useEffect(() => {
    if (hasCheckedUrl) return;
    
    const sharedMix = extractSharedMixFromUrl();
    if (sharedMix) {
      const importedMix = mixService.importMix(
        `${sharedMix.name} (Shared)`, 
        sharedMix.sounds
      );
      
      setMixes(prevMixes => [...prevMixes, importedMix]);
      setActiveMixId(importedMix.id);
      mixService.applyMix(importedMix);
      
      // Remove the mix parameter from URL to prevent reimporting on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('mix');
      window.history.replaceState({}, document.title, url.toString());
    }
    
    setHasCheckedUrl(true);
  }, [hasCheckedUrl]);

  /**
   * Create a new mix
   */
  const createMix = (name: string, sounds: SoundSetting[]): SoundMix => {
    const newMix = mixService.saveMix(name, sounds);
    setMixes(prevMixes => [...prevMixes, newMix]);
    return newMix;
  };

  /**
   * Update an existing mix
   */
  const updateMix = (id: string, name: string, sounds: SoundSetting[]): SoundMix | null => {
    const updatedMix = mixService.updateMix(id, name, sounds);
    
    if (updatedMix) {
      setMixes(prevMixes => 
        prevMixes.map(mix => mix.id === id ? updatedMix : mix)
      );
    }
    
    return updatedMix;
  };

  /**
   * Delete a mix
   */
  const deleteMix = (id: string): boolean => {
    const success = mixService.deleteMix(id);
    
    if (success) {
      setMixes(prevMixes => prevMixes.filter(mix => mix.id !== id));
      
      // Clear active mix if it was deleted
      if (activeMixId === id) {
        setActiveMixId(null);
      }
    }
    
    return success;
  };

  /**
   * Apply a mix - load and play all its sounds
   */
  const applyMix = (mix: SoundMix): void => {
    mixService.applyMix(mix);
    setActiveMixId(mix.id);
  };

  /**
   * Get the currently active mix
   */
  const getActiveMix = (): SoundMix | undefined => {
    return activeMixId ? mixes.find(mix => mix.id === activeMixId) : undefined;
  };

  /**
   * Import a shared mix directly
   */
  const importMix = (name: string, sounds: SoundSetting[]): SoundMix => {
    const importedMix = mixService.importMix(name, sounds);
    setMixes(prevMixes => [...prevMixes, importedMix]);
    return importedMix;
  };

  return {
    mixes,
    activeMixId,
    createMix,
    updateMix,
    deleteMix,
    applyMix,
    getActiveMix,
    importMix
  };
}

export default useMixes;