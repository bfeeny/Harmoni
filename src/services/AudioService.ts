/**
 * AudioService - Manages audio playback for the Harmoni soundscape app
 */
export class AudioService {
  private audioContext: AudioContext | null = null;
  private audioSources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private masterGainNode: GainNode | null = null;
  private analyzerNodes: Set<AnalyserNode> = new Set();
  private fadeOutTimeoutId: number | null = null;
  
  /**
   * Initialize the audio context
   */
  initialize(): void {
    if (this.audioContext === null) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
    }
  }
  
  /**
   * Get the audio context
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
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
    if (!this.audioContext || !this.masterGainNode) {
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
    gainNode.connect(this.masterGainNode!);
    
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
   * Fade out and stop a sound
   * @param id - Sound identifier
   * @param fadeOutDuration - Duration of the fade-out in milliseconds
   */
  fadeOutAndStopSound(id: string, fadeOutDuration: number): void {
    const gainNode = this.gainNodes.get(id);
    const source = this.audioSources.get(id);
    
    if (!gainNode || !source || !this.audioContext) {
      return;
    }
    
    const currentTime = this.audioContext.currentTime;
    const currentVolume = gainNode.gain.value;
    
    // Schedule the fade-out
    gainNode.gain.setValueAtTime(currentVolume, currentTime);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration / 1000);
    
    // Schedule stopping the sound after fade-out
    setTimeout(() => {
      this.stopSound(id);
    }, fadeOutDuration);
  }
  
  /**
   * Fade out all sounds gradually and stop them
   * @param fadeOutDuration - Duration of the fade-out in milliseconds
   * @returns A Promise that resolves when all sounds have been stopped
   */
  fadeOutAll(fadeOutDuration: number): Promise<void> {
    // Cancel any ongoing fade-out
    if (this.fadeOutTimeoutId !== null) {
      window.clearTimeout(this.fadeOutTimeoutId);
      this.fadeOutTimeoutId = null;
    }
    
    return new Promise<void>((resolve) => {
      // If no sounds are playing, resolve immediately
      if (!this.masterGainNode || this.audioSources.size === 0 || !this.audioContext) {
        resolve();
        return;
      }
      
      const currentTime = this.audioContext.currentTime;
      const currentMasterVolume = this.masterGainNode.gain.value;
      
      // Schedule the fade-out of the master gain node
      this.masterGainNode.gain.setValueAtTime(currentMasterVolume, currentTime);
      this.masterGainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration / 1000);
      
      // Schedule stopping all sounds and resolving the promise
      this.fadeOutTimeoutId = window.setTimeout(() => {
        this.stopAll();
        
        // Reset the master gain for future playback
        if (this.masterGainNode) {
          this.masterGainNode.gain.setValueAtTime(1, this.audioContext!.currentTime);
        }
        
        resolve();
      }, fadeOutDuration);
    });
  }
  
  /**
   * Adjust the volume of a playing sound
   * @param id - Sound identifier
   * @param volume - New volume level (0.0 to 1.0)
   * @param fadeTime - Optional time to fade to new volume in milliseconds
   */
  setVolume(id: string, volume: number, fadeTime: number = 0): void {
    const gainNode = this.gainNodes.get(id);
    const safeVolume = Math.max(0, Math.min(1, volume));
    
    if (gainNode && this.audioContext) {
      if (fadeTime > 0) {
        // Gradual volume change
        const currentTime = this.audioContext.currentTime;
        const currentVolume = gainNode.gain.value;
        
        gainNode.gain.setValueAtTime(currentVolume, currentTime);
        gainNode.gain.linearRampToValueAtTime(
          safeVolume, 
          currentTime + fadeTime / 1000
        );
      } else {
        // Immediate volume change
        gainNode.gain.value = safeVolume;
      }
    }
  }
  
  /**
   * Get the current volume of a playing sound
   * @param id - Sound identifier
   * @returns The current volume level (0.0 to 1.0) or undefined if sound not playing
   */
  getVolume(id: string): number | undefined {
    const gainNode = this.gainNodes.get(id);
    return gainNode?.gain.value;
  }
  
  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    // Cancel any ongoing fade-out
    if (this.fadeOutTimeoutId !== null) {
      window.clearTimeout(this.fadeOutTimeoutId);
      this.fadeOutTimeoutId = null;
    }
    
    this.audioSources.forEach((source, id) => {
      this.stopSound(id);
    });
  }
  
  /**
   * Get the list of currently playing sound IDs
   */
  getActiveSounds(): string[] {
    return Array.from(this.audioSources.keys());
  }
  
  /**
   * Connect an analyzer node to the master gain node
   * @param analyzerNode - The analyzer node to connect
   */
  connectAnalyzer(analyzerNode: AnalyserNode): void {
    if (this.masterGainNode) {
      this.masterGainNode.connect(analyzerNode);
      this.analyzerNodes.add(analyzerNode);
    }
  }
  
  /**
   * Disconnect an analyzer node
   * @param analyzerNode - The analyzer node to disconnect
   */
  disconnectAnalyzer(analyzerNode: AnalyserNode): void {
    if (this.masterGainNode && this.analyzerNodes.has(analyzerNode)) {
      try {
        this.masterGainNode.disconnect(analyzerNode);
      } catch (e) {
        // Ignore errors if already disconnected
      }
      this.analyzerNodes.delete(analyzerNode);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAll();
    
    // Disconnect all analyzer nodes
    this.analyzerNodes.forEach(analyzer => {
      this.disconnectAnalyzer(analyzer);
    });
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.masterGainNode = null;
    this.audioBuffers.clear();
  }
}

// Export a singleton instance
export const audioService = new AudioService();