import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mixService } from './MixService';
import { audioService } from './AudioService';

// Mock AudioService methods
vi.mock('./AudioService', () => ({
  audioService: {
    stopAll: vi.fn(),
    playSound: vi.fn(),
  },
}));

describe('MixService', () => {
  const testMix = {
    name: 'Test Mix',
    sounds: [
      { soundId: 'sound1', volume: 0.5, enabled: true },
      { soundId: 'sound2', volume: 0.7, enabled: false },
    ],
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSavedMixes', () => {
    it('should return empty array when no mixes are saved', () => {
      const mixes = mixService.getSavedMixes();
      expect(mixes).toEqual([]);
    });

    it('should return saved mixes from localStorage', () => {
      // Manually set up localStorage with a saved mix
      const mockMix = {
        id: 'mix_123',
        name: 'Test Mix',
        sounds: [{ soundId: 'sound1', volume: 0.5, enabled: true }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('harmoni_sound_mixes', JSON.stringify([mockMix]));
      
      const mixes = mixService.getSavedMixes();
      expect(mixes).toHaveLength(1);
      expect(mixes[0].id).toBe(mockMix.id);
      expect(mixes[0].name).toBe(mockMix.name);
      expect(mixes[0].createdAt).toBeInstanceOf(Date);
      expect(mixes[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('saveMix', () => {
    it('should save a new mix to localStorage', () => {
      const newMix = mixService.saveMix(testMix.name, testMix.sounds);
      
      expect(newMix.id).toContain('mix_');
      expect(newMix.name).toBe(testMix.name);
      expect(newMix.sounds).toEqual(testMix.sounds);
      expect(newMix.createdAt).toBeInstanceOf(Date);
      expect(newMix.updatedAt).toBeInstanceOf(Date);
      
      // Verify it was saved to localStorage
      const savedMixes = mixService.getSavedMixes();
      expect(savedMixes).toHaveLength(1);
      expect(savedMixes[0].id).toBe(newMix.id);
    });
  });

  describe('updateMix', () => {
    it('should update an existing mix', () => {
      // First save a mix
      const newMix = mixService.saveMix(testMix.name, testMix.sounds);
      
      // Then update it
      const updatedName = 'Updated Mix';
      const updatedSounds = [{ soundId: 'sound3', volume: 0.3, enabled: true }];
      
      const updatedMix = mixService.updateMix(newMix.id, updatedName, updatedSounds);
      
      expect(updatedMix).not.toBeNull();
      expect(updatedMix?.id).toBe(newMix.id);
      expect(updatedMix?.name).toBe(updatedName);
      expect(updatedMix?.sounds).toEqual(updatedSounds);
      expect(updatedMix?.createdAt).toEqual(newMix.createdAt);
      expect(updatedMix?.updatedAt).not.toEqual(newMix.updatedAt);
      
      // Verify it was updated in localStorage
      const savedMixes = mixService.getSavedMixes();
      expect(savedMixes).toHaveLength(1);
      expect(savedMixes[0].name).toBe(updatedName);
    });

    it('should return null when trying to update a non-existent mix', () => {
      const result = mixService.updateMix('non-existent-id', 'New Name', []);
      expect(result).toBeNull();
    });
  });

  describe('deleteMix', () => {
    it('should delete an existing mix', () => {
      // First save a mix
      const newMix = mixService.saveMix(testMix.name, testMix.sounds);
      
      // Verify it was saved
      expect(mixService.getSavedMixes()).toHaveLength(1);
      
      // Delete it
      const result = mixService.deleteMix(newMix.id);
      
      expect(result).toBe(true);
      
      // Verify it was deleted
      expect(mixService.getSavedMixes()).toHaveLength(0);
    });

    it('should return false when trying to delete a non-existent mix', () => {
      const result = mixService.deleteMix('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('applyMix', () => {
    it('should apply a mix by stopping all sounds and playing the enabled ones', () => {
      const mix = {
        id: 'mix_123',
        name: 'Test Mix',
        sounds: [
          { soundId: 'sound1', volume: 0.5, enabled: true },
          { soundId: 'sound2', volume: 0.7, enabled: false },
          { soundId: 'sound3', volume: 0.6, enabled: true },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mixService.applyMix(mix);
      
      // Should stop all sounds first
      expect(audioService.stopAll).toHaveBeenCalledTimes(1);
      
      // Should play only the enabled sounds
      expect(audioService.playSound).toHaveBeenCalledTimes(2);
      expect(audioService.playSound).toHaveBeenCalledWith('sound1', 0.5);
      expect(audioService.playSound).toHaveBeenCalledWith('sound3', 0.6);
      expect(audioService.playSound).not.toHaveBeenCalledWith('sound2', 0.7);
    });
  });

  describe('importMix', () => {
    it('should import a shared mix', () => {
      const importedMix = mixService.importMix('Imported Mix', testMix.sounds);
      
      expect(importedMix.id).toContain('mix_');
      expect(importedMix.name).toBe('Imported Mix');
      expect(importedMix.sounds).toEqual(testMix.sounds);
      
      // Verify it was saved to localStorage
      const savedMixes = mixService.getSavedMixes();
      expect(savedMixes).toHaveLength(1);
      expect(savedMixes[0].id).toBe(importedMix.id);
    });
  });
});