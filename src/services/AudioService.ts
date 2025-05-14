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