import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioService } from './AudioService';

describe('AudioService', () => {
  let audioService: AudioService;
  
  // Mock fetch for loading sounds
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    })
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
    audioService = new AudioService();
    // Initialize the service to create the audio context
    audioService.initialize();
  });
  
  describe('initialize', () => {
    it('should create an audio context and master gain node', () => {
      // Reset the service to test initialization
      audioService = new AudioService();
      
      // AudioContext should be null initially
      expect(audioService['audioContext']).toBeNull();
      expect(audioService['masterGainNode']).toBeNull();
      
      // Initialize the service
      audioService.initialize();
      
      // AudioContext and master gain node should be created
      expect(audioService['audioContext']).not.toBeNull();
      expect(audioService['masterGainNode']).not.toBeNull();
      
      // Master gain node should be connected to the destination
      expect(audioService['masterGainNode']?.connect).toHaveBeenCalled();
    });
    
    it('should not create a new context if one already exists', () => {
      // AudioContext should exist after the beforeEach initialization
      const originalContext = audioService['audioContext'];
      
      // Re-initialize
      audioService.initialize();
      
      // Should be the same context
      expect(audioService['audioContext']).toBe(originalContext);
    });
  });
  
  describe('loadSound', () => {
    it('should fetch the sound and decode it', async () => {
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      
      // Fetch should have been called
      expect(fetch).toHaveBeenCalledWith('https://example.com/test.mp3');
      
      // AudioContext.decodeAudioData should have been called
      expect(audioService['audioContext']?.decodeAudioData).toHaveBeenCalled();
      
      // The buffer should be stored in the audioBuffers map
      expect(audioService['audioBuffers'].has('test-sound')).toBe(true);
    });
    
    it('should initialize the audio context if not already initialized', async () => {
      // Reset the service
      audioService = new AudioService();
      
      // AudioContext should be null
      expect(audioService['audioContext']).toBeNull();
      
      // Load a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      
      // AudioContext should now exist
      expect(audioService['audioContext']).not.toBeNull();
    });
  });
  
  describe('playSound', () => {
    it('should create a buffer source and play the sound', async () => {
      // First load a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      
      // Now play it
      audioService.playSound('test-sound', 0.8);
      
      // A source node should have been created
      expect(audioService['audioSources'].has('test-sound')).toBe(true);
      
      // A gain node should have been created
      expect(audioService['gainNodes'].has('test-sound')).toBe(true);
      
      // The gain node's gain value should be set to the provided volume
      expect(audioService['gainNodes'].get('test-sound')?.gain.value).toBe(0.8);
      
      // The source should be started
      const source = audioService['audioSources'].get('test-sound');
      expect(source?.start).toHaveBeenCalled();
    });
    
    it('should stop an existing sound before playing it again', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound');
      
      // Mock the stopSound method
      const stopSoundSpy = vi.spyOn(audioService, 'stopSound');
      
      // Play the sound again
      audioService.playSound('test-sound');
      
      // stopSound should have been called for the existing sound
      expect(stopSoundSpy).toHaveBeenCalledWith('test-sound');
    });
  });
  
  describe('stopSound', () => {
    it('should stop a playing sound and clean up resources', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound');
      
      // Now stop it
      audioService.stopSound('test-sound');
      
      // The source should be stopped
      const source = audioService['audioSources'].get('test-sound');
      expect(source?.stop).toHaveBeenCalled();
      
      // The source and gain node should be removed from the maps
      expect(audioService['audioSources'].has('test-sound')).toBe(false);
      expect(audioService['gainNodes'].has('test-sound')).toBe(false);
    });
    
    it('should do nothing if the sound is not playing', () => {
      // Try to stop a non-existent sound
      audioService.stopSound('non-existent-sound');
      
      // Nothing should happen, no errors
      expect(true).toBe(true);
    });
  });
  
  describe('fadeOutAndStopSound', () => {
    it('should schedule a fade-out and stop the sound after the fade-out', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound');
      
      // Mock setTimeout
      vi.spyOn(global, 'setTimeout');
      
      // Now fade it out
      audioService.fadeOutAndStopSound('test-sound', 1000);
      
      // The gain node gain should be scheduled to ramp to 0
      const gainNode = audioService['gainNodes'].get('test-sound');
      expect(gainNode?.gain.linearRampToValueAtTime).toHaveBeenCalled();
      
      // setTimeout should be called to stop the sound after the fade-out
      expect(setTimeout).toHaveBeenCalled();
    });
  });
  
  describe('fadeOutAll', () => {
    it('should fade out the master gain node and stop all sounds', async () => {
      // First load and play some sounds
      await audioService.loadSound('test-sound-1', 'https://example.com/test1.mp3');
      await audioService.loadSound('test-sound-2', 'https://example.com/test2.mp3');
      audioService.playSound('test-sound-1');
      audioService.playSound('test-sound-2');
      
      // Mock the stopAll method
      const stopAllSpy = vi.spyOn(audioService, 'stopAll');
      
      // Mock window.setTimeout to resolve immediately
      vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        if (typeof callback === 'function') callback();
        return 123;
      });
      
      // Now fade out all sounds
      const fadeOutPromise = audioService.fadeOutAll(1000);
      
      // The master gain node gain should be scheduled to ramp to 0
      expect(audioService['masterGainNode']?.gain.linearRampToValueAtTime).toHaveBeenCalled();
      
      // Wait for the fade-out to complete
      await fadeOutPromise;
      
      // stopAll should have been called
      expect(stopAllSpy).toHaveBeenCalled();
      
      // The master gain node should be reset to 1
      expect(audioService['masterGainNode']?.gain.setValueAtTime).toHaveBeenCalledWith(
        1, 
        expect.anything()
      );
    });
  });
  
  describe('setVolume', () => {
    it('should set the volume of a playing sound', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound', 0.5);
      
      // Now change the volume
      audioService.setVolume('test-sound', 0.8);
      
      // The gain node's gain value should be updated
      expect(audioService['gainNodes'].get('test-sound')?.gain.value).toBe(0.8);
    });
    
    it('should do nothing if the sound is not playing', () => {
      // Try to set the volume of a non-existent sound
      audioService.setVolume('non-existent-sound', 0.8);
      
      // Nothing should happen, no errors
      expect(true).toBe(true);
    });
    
    it('should clamp the volume between 0 and 1', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound', 0.5);
      
      // Set volume below 0
      audioService.setVolume('test-sound', -0.2);
      expect(audioService['gainNodes'].get('test-sound')?.gain.value).toBe(0);
      
      // Set volume above 1
      audioService.setVolume('test-sound', 1.5);
      expect(audioService['gainNodes'].get('test-sound')?.gain.value).toBe(1);
    });
    
    it('should use linearRampToValueAtTime when fadeTime is provided', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound', 0.5);
      
      // Set volume with fade
      audioService.setVolume('test-sound', 0.8, 1000);
      
      // The gain node gain should be scheduled to ramp to the new value
      const gainNode = audioService['gainNodes'].get('test-sound');
      expect(gainNode?.gain.linearRampToValueAtTime).toHaveBeenCalled();
    });
  });
  
  describe('getVolume', () => {
    it('should return the volume of a playing sound', async () => {
      // First load and play a sound
      await audioService.loadSound('test-sound', 'https://example.com/test.mp3');
      audioService.playSound('test-sound', 0.7);
      
      // Get the volume
      const volume = audioService.getVolume('test-sound');
      
      // Should return the current volume
      expect(volume).toBe(0.7);
    });
    
    it('should return undefined if the sound is not playing', () => {
      // Try to get the volume of a non-existent sound
      const volume = audioService.getVolume('non-existent-sound');
      
      // Should return undefined
      expect(volume).toBeUndefined();
    });
  });
  
  describe('stopAll', () => {
    it('should stop all playing sounds', async () => {
      // First load and play some sounds
      await audioService.loadSound('test-sound-1', 'https://example.com/test1.mp3');
      await audioService.loadSound('test-sound-2', 'https://example.com/test2.mp3');
      audioService.playSound('test-sound-1');
      audioService.playSound('test-sound-2');
      
      // Mock the stopSound method
      const stopSoundSpy = vi.spyOn(audioService, 'stopSound');
      
      // Now stop all sounds
      audioService.stopAll();
      
      // stopSound should have been called for each sound
      expect(stopSoundSpy).toHaveBeenCalledTimes(2);
      expect(stopSoundSpy).toHaveBeenCalledWith('test-sound-1');
      expect(stopSoundSpy).toHaveBeenCalledWith('test-sound-2');
    });
  });
  
  describe('getActiveSounds', () => {
    it('should return the IDs of all playing sounds', async () => {
      // First load and play some sounds
      await audioService.loadSound('test-sound-1', 'https://example.com/test1.mp3');
      await audioService.loadSound('test-sound-2', 'https://example.com/test2.mp3');
      audioService.playSound('test-sound-1');
      audioService.playSound('test-sound-2');
      
      // Get the active sounds
      const activeSounds = audioService.getActiveSounds();
      
      // Should return an array of sound IDs
      expect(activeSounds).toContain('test-sound-1');
      expect(activeSounds).toContain('test-sound-2');
      expect(activeSounds.length).toBe(2);
    });
  });
  
  describe('analyser connections', () => {
    it('should connect an analyser node to the master gain node', () => {
      // Create a mock analyser node
      const analyserNode = new AnalyserNodeMock();
      
      // Connect it
      audioService.connectAnalyzer(analyserNode as unknown as AnalyserNode);
      
      // The master gain node should be connected to the analyser
      expect(audioService['masterGainNode']?.connect).toHaveBeenCalledWith(analyserNode);
      
      // The analyser should be added to the set
      expect(audioService['analyzerNodes'].has(analyserNode as unknown as AnalyserNode)).toBe(true);
    });
    
    it('should disconnect an analyser node', () => {
      // Create a mock analyser node and connect it
      const analyserNode = new AnalyserNodeMock();
      audioService.connectAnalyzer(analyserNode as unknown as AnalyserNode);
      
      // Now disconnect it
      audioService.disconnectAnalyzer(analyserNode as unknown as AnalyserNode);
      
      // The master gain node should be disconnected from the analyser
      expect(audioService['masterGainNode']?.disconnect).toHaveBeenCalledWith(analyserNode);
      
      // The analyser should be removed from the set
      expect(audioService['analyzerNodes'].has(analyserNode as unknown as AnalyserNode)).toBe(false);
    });
  });
  
  describe('dispose', () => {
    it('should clean up all resources', async () => {
      // First load and play some sounds
      await audioService.loadSound('test-sound-1', 'https://example.com/test1.mp3');
      await audioService.loadSound('test-sound-2', 'https://example.com/test2.mp3');
      audioService.playSound('test-sound-1');
      audioService.playSound('test-sound-2');
      
      // Connect an analyser
      const analyserNode = new AnalyserNodeMock();
      audioService.connectAnalyzer(analyserNode as unknown as AnalyserNode);
      
      // Mock the stopAll and disconnectAnalyzer methods
      const stopAllSpy = vi.spyOn(audioService, 'stopAll');
      const disconnectAnalyzerSpy = vi.spyOn(audioService, 'disconnectAnalyzer');
      
      // Now dispose
      audioService.dispose();
      
      // stopAll should have been called
      expect(stopAllSpy).toHaveBeenCalled();
      
      // disconnectAnalyzer should have been called for each analyser
      expect(disconnectAnalyzerSpy).toHaveBeenCalledWith(analyserNode);
      
      // The audio context should be closed
      expect(audioService['audioContext']?.close).toHaveBeenCalled();
      
      // All resources should be cleared
      expect(audioService['audioContext']).toBeNull();
      expect(audioService['masterGainNode']).toBeNull();
      expect(audioService['audioBuffers'].size).toBe(0);
    });
  });
});