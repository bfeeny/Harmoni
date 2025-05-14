import { Sound, SoundCategory } from '../utils/types';

/**
 * Sound library - a collection of available sound samples
 * Note: Actual sound files would need to be added to the public directory
 */
export const soundLibrary: Sound[] = [
  // Nature sounds
  {
    id: 'rain',
    name: 'Rainfall',
    category: SoundCategory.Nature,
    description: 'Gentle rain falling on a rooftop',
    filepath: '/sounds/nature/rain.mp3',
    iconPath: '/icons/rain.svg',
  },
  {
    id: 'forest',
    name: 'Forest',
    category: SoundCategory.Nature,
    description: 'Peaceful forest with birds chirping',
    filepath: '/sounds/nature/forest.mp3',
    iconPath: '/icons/forest.svg',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    category: SoundCategory.Nature,
    description: 'Waves crashing on the shore',
    filepath: '/sounds/nature/ocean.mp3',
    iconPath: '/icons/ocean.svg',
  },
  {
    id: 'thunder',
    name: 'Distant Thunder',
    category: SoundCategory.Nature,
    description: 'Rolling thunder in the distance',
    filepath: '/sounds/nature/thunder.mp3',
    iconPath: '/icons/thunder.svg',
  },
  
  // Ambient sounds
  {
    id: 'cafe',
    name: 'Café',
    category: SoundCategory.Ambient,
    description: 'Quiet café with soft background chatter',
    filepath: '/sounds/ambient/cafe.mp3',
    iconPath: '/icons/cafe.svg',
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    category: SoundCategory.Ambient,
    description: 'Crackling fireplace with wood burning',
    filepath: '/sounds/ambient/fireplace.mp3',
    iconPath: '/icons/fireplace.svg',
  },
  
  // White noise
  {
    id: 'white-noise',
    name: 'White Noise',
    category: SoundCategory.White,
    description: 'Pure white noise',
    filepath: '/sounds/white/white-noise.mp3',
    iconPath: '/icons/white-noise.svg',
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    category: SoundCategory.White,
    description: 'Brown noise (deeper than white noise)',
    filepath: '/sounds/white/brown-noise.mp3',
    iconPath: '/icons/brown-noise.svg',
  },
  {
    id: 'pink-noise',
    name: 'Pink Noise',
    category: SoundCategory.White,
    description: 'Pink noise (balanced frequency)',
    filepath: '/sounds/white/pink-noise.mp3',
    iconPath: '/icons/pink-noise.svg',
  },
  
  // Meditation
  {
    id: 'singing-bowl',
    name: 'Singing Bowl',
    category: SoundCategory.Meditation,
    description: 'Tibetan singing bowl resonance',
    filepath: '/sounds/meditation/singing-bowl.mp3',
    iconPath: '/icons/singing-bowl.svg',
  },
  {
    id: 'om-chant',
    name: 'Om Chant',
    category: SoundCategory.Meditation,
    description: 'Deep om chanting',
    filepath: '/sounds/meditation/om-chant.mp3',
    iconPath: '/icons/om.svg',
  },
];