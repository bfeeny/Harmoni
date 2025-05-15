import { SoundMix, SoundSetting } from '../utils/types';
import { audioService } from './AudioService';

/**
 * MixService - Manages saving, loading, sharing, and deleting sound mixes
 */
export class MixService {
  private readonly STORAGE_KEY = 'harmoni_sound_mixes';
  
  /**
   * Retrieve all saved mixes from local storage
   */
  getSavedMixes(): SoundMix[] {
    try {
      const savedMixesJSON = localStorage.getItem(this.STORAGE_KEY);
      if (!savedMixesJSON) {
        return [];
      }

      const savedMixes = JSON.parse(savedMixesJSON) as SoundMix[];
      
      // Convert string dates to Date objects
      return savedMixes.map(mix => ({
        ...mix,
        createdAt: new Date(mix.createdAt),
        updatedAt: new Date(mix.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading saved mixes:', error);
      return [];
    }
  }
  
  /**
   * Import a shared mix
   * @param name Mix name
   * @param sounds Sound settings
   * @returns The imported mix
   */
  importMix(name: string, sounds: SoundSetting[]): SoundMix {
    return this.saveMix(name, sounds);
  }

  /**
   * Save a new mix to local storage
   */
  saveMix(name: string, sounds: SoundSetting[]): SoundMix {
    const mixes = this.getSavedMixes();
    
    // Generate a unique ID
    const id = `mix_${Date.now()}`;
    
    const newMix: SoundMix = {
      id,
      name,
      sounds,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mixes.push(newMix);
    this.saveMixesToStorage(mixes);
    
    return newMix;
  }

  /**
   * Update an existing mix
   */
  updateMix(id: string, name: string, sounds: SoundSetting[]): SoundMix | null {
    const mixes = this.getSavedMixes();
    const mixIndex = mixes.findIndex(mix => mix.id === id);
    
    if (mixIndex === -1) {
      return null;
    }
    
    const updatedMix: SoundMix = {
      ...mixes[mixIndex],
      name,
      sounds,
      updatedAt: new Date()
    };
    
    mixes[mixIndex] = updatedMix;
    this.saveMixesToStorage(mixes);
    
    return updatedMix;
  }

  /**
   * Delete a mix
   */
  deleteMix(id: string): boolean {
    const mixes = this.getSavedMixes();
    const filteredMixes = mixes.filter(mix => mix.id !== id);
    
    if (filteredMixes.length === mixes.length) {
      return false; // Mix not found
    }
    
    this.saveMixesToStorage(filteredMixes);
    return true;
  }

  /**
   * Apply a mix - load and play all its sounds
   */
  applyMix(mix: SoundMix): void {
    // First stop all currently playing sounds
    audioService.stopAll();
    
    // Start playing each sound in the mix
    mix.sounds.forEach(sound => {
      if (sound.enabled) {
        audioService.playSound(sound.soundId, sound.volume);
      }
    });
  }

  /**
   * Save mixes to local storage
   */
  private saveMixesToStorage(mixes: SoundMix[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mixes));
  }
}

// Export a singleton instance
export const mixService = new MixService();