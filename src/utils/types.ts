/**
 * Sound category types
 */
export enum SoundCategory {
  Nature = 'nature',
  Ambient = 'ambient',
  White = 'white',
  Meditation = 'meditation',
}

/**
 * Sound source information
 */
export interface SoundSource {
  id: number | string;
  url: string;
  license: string;
  username?: string;
}

/**
 * Sound data interface
 */
export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  description: string;
  filepath: string;
  iconPath?: string;
  source?: SoundSource;
}

/**
 * Sound Mix interface for a custom user mix
 */
export interface SoundMix {
  id: string;
  name: string;
  sounds: SoundSetting[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sound setting within a mix
 */
export interface SoundSetting {
  soundId: string;
  volume: number;
  enabled: boolean;
}

/**
 * Timer settings
 */
export interface TimerSettings {
  duration: number; // in minutes
  fadeOutDuration: number; // in seconds
  enabled: boolean;
}