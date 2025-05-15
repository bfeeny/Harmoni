import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMixes } from './useMixes';
import { mixService } from '../services/MixService';

// Mock the MixService
vi.mock('../services/MixService', () => ({
  mixService: {
    getSavedMixes: vi.fn(),
    saveMix: vi.fn(),
    updateMix: vi.fn(),
    deleteMix: vi.fn(),
    applyMix: vi.fn(),
    importMix: vi.fn(),
  },
}));

// Mock the shareUtils
vi.mock('../utils/shareUtils', () => ({
  extractSharedMixFromUrl: vi.fn(),
}));

describe('useMixes', () => {
  const mockMix = {
    id: 'mix_123',
    name: 'Test Mix',
    sounds: [
      { soundId: 'sound1', volume: 0.5, enabled: true },
      { soundId: 'sound2', volume: 0.7, enabled: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default implementation for getSavedMixes
    vi.mocked(mixService.getSavedMixes).mockReturnValue([]);
    
    // Default implementation for URL extraction
    vi.mocked(require('../utils/shareUtils').extractSharedMixFromUrl).mockReturnValue(null);
    
    // Set up mock for window.history.replaceState
    window.history.replaceState = vi.fn();
  });

  it('should load saved mixes on mount', () => {
    vi.mocked(mixService.getSavedMixes).mockReturnValueOnce([mockMix]);
    
    const { result } = renderHook(() => useMixes());
    
    expect(mixService.getSavedMixes).toHaveBeenCalledTimes(1);
    expect(result.current.mixes).toEqual([mockMix]);
  });

  it('should create a new mix', () => {
    vi.mocked(mixService.saveMix).mockReturnValueOnce(mockMix);
    
    const { result } = renderHook(() => useMixes());
    
    act(() => {
      result.current.createMix('Test Mix', mockMix.sounds);
    });
    
    expect(mixService.saveMix).toHaveBeenCalledWith('Test Mix', mockMix.sounds);
    expect(result.current.mixes).toEqual([mockMix]);
  });

  it('should update an existing mix', () => {
    const initialMixes = [mockMix];
    vi.mocked(mixService.getSavedMixes).mockReturnValueOnce(initialMixes);
    
    const updatedMix = {
      ...mockMix,
      name: 'Updated Mix',
      updatedAt: new Date(),
    };
    
    vi.mocked(mixService.updateMix).mockReturnValueOnce(updatedMix);
    
    const { result } = renderHook(() => useMixes());
    
    act(() => {
      result.current.updateMix(mockMix.id, 'Updated Mix', mockMix.sounds);
    });
    
    expect(mixService.updateMix).toHaveBeenCalledWith(
      mockMix.id, 
      'Updated Mix', 
      mockMix.sounds
    );
    
    expect(result.current.mixes).toEqual([updatedMix]);
  });

  it('should delete a mix', () => {
    const initialMixes = [mockMix];
    vi.mocked(mixService.getSavedMixes).mockReturnValueOnce(initialMixes);
    vi.mocked(mixService.deleteMix).mockReturnValueOnce(true);
    
    const { result } = renderHook(() => useMixes());
    
    // Set the active mix ID
    act(() => {
      result.current.applyMix(mockMix);
    });
    
    expect(result.current.activeMixId).toBe(mockMix.id);
    
    // Delete the mix
    act(() => {
      result.current.deleteMix(mockMix.id);
    });
    
    expect(mixService.deleteMix).toHaveBeenCalledWith(mockMix.id);
    expect(result.current.mixes).toEqual([]);
    
    // Check that the active mix ID is cleared
    expect(result.current.activeMixId).toBeNull();
  });

  it('should apply a mix', () => {
    const { result } = renderHook(() => useMixes());
    
    act(() => {
      result.current.applyMix(mockMix);
    });
    
    expect(mixService.applyMix).toHaveBeenCalledWith(mockMix);
    expect(result.current.activeMixId).toBe(mockMix.id);
  });

  it('should get the active mix', () => {
    const initialMixes = [mockMix];
    vi.mocked(mixService.getSavedMixes).mockReturnValueOnce(initialMixes);
    
    const { result } = renderHook(() => useMixes());
    
    act(() => {
      result.current.applyMix(mockMix);
    });
    
    const activeMix = result.current.getActiveMix();
    expect(activeMix).toEqual(mockMix);
  });

  it('should import a shared mix from URL', () => {
    const sharedMixData = {
      name: 'Shared Mix',
      sounds: [
        { soundId: 'sound1', volume: 0.5, enabled: true },
      ],
    };
    
    const importedMix = {
      id: 'mix_imported',
      name: 'Shared Mix (Shared)',
      sounds: sharedMixData.sounds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Mock the extracted mix from URL
    vi.mocked(require('../utils/shareUtils').extractSharedMixFromUrl).mockReturnValueOnce(sharedMixData);
    
    // Mock the imported mix
    vi.mocked(mixService.importMix).mockReturnValueOnce(importedMix);
    
    // Render the hook
    const { result } = renderHook(() => useMixes());
    
    // Check that the mix was imported and applied
    expect(mixService.importMix).toHaveBeenCalledWith(
      'Shared Mix (Shared)',
      sharedMixData.sounds
    );
    
    expect(mixService.applyMix).toHaveBeenCalledWith(importedMix);
    expect(result.current.mixes).toEqual([importedMix]);
    expect(result.current.activeMixId).toBe(importedMix.id);
    
    // The URL parameter should have been removed
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it('should import a mix directly', () => {
    const importedMix = {
      id: 'mix_imported',
      name: 'Imported Mix',
      sounds: mockMix.sounds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    vi.mocked(mixService.importMix).mockReturnValueOnce(importedMix);
    
    const { result } = renderHook(() => useMixes());
    
    act(() => {
      result.current.importMix('Imported Mix', mockMix.sounds);
    });
    
    expect(mixService.importMix).toHaveBeenCalledWith(
      'Imported Mix',
      mockMix.sounds
    );
    
    expect(result.current.mixes).toEqual([importedMix]);
  });
});