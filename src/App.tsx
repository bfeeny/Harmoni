import { useState, useEffect } from 'react';
import { Sound, SoundCategory } from './utils/types';
import { audioService } from './services/AudioService';
import SoundGrid from './components/SoundGrid';
import CategoryFilter from './components/CategoryFilter';
import Timer from './components/Timer';
import MixControls from './components/MixControls';
import FreesoundSearch from './components/FreesoundSearch';
import AudioVisualization from './components/AudioVisualization';
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
  const [visualizationVisible, setVisualizationVisible] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

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

  // Toggle visualization when there are no active sounds
  useEffect(() => {
    if (activeSounds.size === 0 && !isFadingOut) {
      setVisualizationVisible(false);
    } else if (!visualizationVisible && activeSounds.size > 0) {
      setVisualizationVisible(true);
    }
  }, [activeSounds, visualizationVisible, isFadingOut]);

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

    // Ensure visualization is visible
    setVisualizationVisible(true);
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
  const handleTimerComplete = (fadeOutDuration: number) => {
    // If fade-out is enabled (duration > 0)
    if (fadeOutDuration > 0) {
      setIsFadingOut(true);
      
      // Fade out all sounds gradually
      audioService.fadeOutAll(fadeOutDuration).then(() => {
        // Clear active sounds after fade-out is complete
        setActiveSounds(new Set());
        setIsFadingOut(false);
      });
    } else {
      // No fade-out, stop sounds immediately
      audioService.stopAll();
      setActiveSounds(new Set());
    }
  };

  // Handle timer update
  const handleTimerUpdate = (timeRemaining: number) => {
    // If we're in the fade-out period, update the UI accordingly
    if (timeRemaining <= 0) {
      // Timer has ended, handled by handleTimerComplete
    }
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

  // Toggle visualization visibility
  const toggleVisualization = () => {
    setVisualizationVisible(!visualizationVisible);
  };

  return (
    <div className={`app ${isFadingOut ? 'fading-out' : ''}`}>
      <header className="app-header">
        <h1>Harmoni</h1>
        <p>Personalized ambient soundscapes for focus and relaxation</p>
        {isFadingOut && <div className="fade-out-indicator">Fading out sounds...</div>}
      </header>

      <main className="app-main">
        {visualizationVisible && (activeSounds.size > 0 || isFadingOut) && (
          <div className="visualization-container">
            <AudioVisualization 
              activeSounds={activeSounds}
              soundVolumes={soundVolumes}
            />
            <button 
              className="visualization-toggle"
              onClick={toggleVisualization}
              aria-label="Hide visualization"
            >
              <span className="visualization-icon">▼</span>
            </button>
          </div>
        )}

        {!visualizationVisible && activeSounds.size > 0 && (
          <button 
            className="visualization-toggle-button"
            onClick={toggleVisualization}
            aria-label="Show visualization"
          >
            Show Visualization <span className="visualization-icon">▲</span>
          </button>
        )}

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