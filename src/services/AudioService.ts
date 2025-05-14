/**
 * AudioService - Manages audio playback for the Harmoni soundscape app
 */
export class AudioService {
  private audioContext: AudioContext | null = null;
  private audioSources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  
  /**
   * Initialize the audio context
   */
  initialize(): void {
    if (this.audioContext === null) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  /**
   * Load an audio file and store it in the buffer
   * @param id - Unique identifier for the sound
   * @param url - URL to the audio file
   */
  async loadSound(id: string, url: string): Promise<void> {
    if (!this.audioContext) {
      this.initialize();
    }
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(id, audioBuffer);
    } catch (error) {
      console.error(`Error loading sound ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Play a loaded sound
   * @param id - Sound identifier
   * @param volume - Volume level (0.0 to 1.0)
   * @param loop - Whether to loop the sound
   */
  playSound(id: string, volume: number = 1.0, loop: boolean = true): void {
    if (!this.audioContext) {
      this.initialize();
    }
    
    const buffer = this.audioBuffers.get(id);
    if (!buffer) {
      console.error(`Sound ${id} not loaded`);
      return;
    }
    
    // Stop the sound if it's already playing
    this.stopSound(id);
    
    // Create a new source
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    
    // Create a gain node for volume control
    const gainNode = this.audioContext!.createGain();
    gainNode.gain.value = volume;
    
    // Connect the nodes
    source.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    // Store references
    this.audioSources.set(id, source);
    this.gainNodes.set(id, gainNode);
    
    // Start playback
    source.start();
  }
  
  /**
   * Stop a playing sound
   * @param id - Sound identifier
   */
  stopSound(id: string): void {
    const source = this.audioSources.get(id);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if the sound is already stopped
      }
      this.audioSources.delete(id);
      this.gainNodes.delete(id);
    }
  }
  
  /**
   * Adjust the volume of a playing sound
   * @param id - Sound identifier
   * @param volume - New volume level (0.0 to 1.0)
   */
  setVolume(id: string, volume: number): void {
    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    this.audioSources.forEach((source, id) => {
      this.stopSound(id);
    });
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffers.clear();
  }
}

// Export a singleton instance
export const audioService = new AudioService();