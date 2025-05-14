import { useState, useEffect } from 'react';
import { Sound, SoundCategory } from './utils/types';
import { audioService } from './services/AudioService';
import SoundGrid from './components/SoundGrid';
import CategoryFilter from './components/CategoryFilter';
import Timer from './components/Timer';
import MixControls from './components/MixControls';
import FreesoundSearch from './components/FreesoundSearch';
import TabNavigation, { TabId } from './components/TabNavigation';
import { useSoundLibrary } from './hooks/useSoundLibrary';
import './styles/App.css';

function App() {
  const { soundLibrary, addSound } = useSoundLibrary();
  const [activeCategory, setActiveCategory] = useState<SoundCategory | null>(null);
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [soundVolumes, setSoundVolumes] = useState<Map<string, number>>(new Map());
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(TabId.SoundLibrary);

  // Initialize audio context when the page is first interacted with
  useEffect(() => {
    const initAudio = () => {
      if (!isAudioInitialized) {
        audioService.initialize();
        setIsAudioInitialized(true);
        
        // Load all sounds
        Promise.all(
          soundLibrary.map(sound => 
            audioService.loadSound(sound.id, sound.filepath)
              .catch(err => console.error(`Error loading sound ${sound.id}:`, err))
          )
        ).then(() => {
          console.log('All sounds loaded successfully');
        });
        
        // Remove event listener after initialization
        window.removeEventListener('click', initAudio);
        window.removeEventListener('touchstart', initAudio);
      }
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      
      // Clean up audio resources
      audioService.dispose();
    };
  }, [isAudioInitialized, soundLibrary]);

  // Handle play sound
  const handlePlaySound = (id: string) => {
    const sound = soundLibrary.find(s => s.id === id);
    if (!sound) return;

    // Set default volume if not already set
    if (!soundVolumes.has(id)) {
      setSoundVolumes(prevVolumes => {
        const newVolumes = new Map(prevVolumes);
        newVolumes.set(id, 0.5);
        return newVolumes;
      });
    }

    // Play the sound
    audioService.playSound(id, soundVolumes.get(id) || 0.5);
    
    // Update active sounds
    setActiveSounds(prevSounds => {
      const newSounds = new Set(prevSounds);
      newSounds.add(id);
      return newSounds;
    });
  };

  // Handle stop sound
  const handleStopSound = (id: string) => {
    audioService.stopSound(id);
    
    // Update active sounds
    setActiveSounds(prevSounds => {
      const newSounds = new Set(prevSounds);
      newSounds.delete(id);
      return newSounds;
    });
  };

  // Handle volume change
  const handleVolumeChange = (id: string, volume: number) => {
    audioService.setVolume(id, volume);
    
    // Update volume state
    setSoundVolumes(prevVolumes => {
      const newVolumes = new Map(prevVolumes);
      newVolumes.set(id, volume);
      return newVolumes;
    });
  };

  // Handle timer complete
  const handleTimerComplete = () => {
    // Stop all sounds when timer completes
    audioService.stopAll();
    setActiveSounds(new Set());
  };

  // Handle timer update (for potential fade-out implementation)
  const handleTimerUpdate = (timeRemaining: number) => {
    // Could implement fade-out logic here
    console.log(`Timer update: ${timeRemaining} seconds remaining`);
  };

  // Handle adding a new sound from Freesound
  const handleAddSound = (sound: Sound) => {
    const success = addSound(sound);
    if (success) {
      // Load the sound for immediate use
      audioService.loadSound(sound.id, sound.filepath)
        .then(() => {
          console.log(`Sound ${sound.id} loaded successfully`);
          // Switch to sound library tab to show the new sound
          setActiveTab(TabId.SoundLibrary);
          // Reset the category filter to show all sounds
          setActiveCategory(null);
        })
        .catch(err => {
          console.error(`Error loading sound ${sound.id}:`, err);
        });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Harmoni</h1>
        <p>Personalized ambient soundscapes for focus and relaxation</p>
      </header>

      <main className="app-main">
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === TabId.SoundLibrary && (
          <>
            <CategoryFilter 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            <SoundGrid 
              sounds={soundLibrary}
              category={activeCategory}
              activeSounds={activeSounds}
              soundVolumes={soundVolumes}
              onPlay={handlePlaySound}
              onStop={handleStopSound}
              onVolumeChange={handleVolumeChange}
            />
          </>
        )}

        {activeTab === TabId.FreesoundSearch && (
          <FreesoundSearch onAddSound={handleAddSound} />
        )}

        <div className="controls-section">
          <MixControls 
            activeSounds={activeSounds}
            soundVolumes={soundVolumes}
          />

          <Timer 
            onTimerComplete={handleTimerComplete}
            onTimerUpdate={handleTimerUpdate}
          />
        </div>
      </main>
    </div>
  );
}

export default App;