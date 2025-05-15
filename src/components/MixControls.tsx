import { useState } from 'react';
import { SoundMix, SoundSetting } from '../utils/types';
import useMixes from '../hooks/useMixes';
import ShareMixButton from './ShareMixButton';

interface MixControlsProps {
  activeSounds: Set<string>;
  soundVolumes: Map<string, number>;
}

export default function MixControls({ activeSounds, soundVolumes }: MixControlsProps) {
  const { mixes, activeMixId, createMix, updateMix, deleteMix, applyMix } = useMixes();
  const [mixName, setMixName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editMixId, setEditMixId] = useState<string | null>(null);
  const [showMixList, setShowMixList] = useState(false);

  // Convert current sound state to SoundSettings array
  const getCurrentSoundSettings = (): SoundSetting[] => {
    const settings: SoundSetting[] = [];
    
    // Convert activeSounds Set and soundVolumes Map to SoundSetting array
    for (const [soundId, volume] of soundVolumes.entries()) {
      settings.push({
        soundId,
        volume,
        enabled: activeSounds.has(soundId)
      });
    }
    
    return settings;
  };

  // Handle saving a new mix
  const handleSaveMix = () => {
    if (!mixName.trim()) {
      alert('Please enter a name for your mix');
      return;
    }
    
    if (activeSounds.size === 0) {
      alert('Please add at least one sound to your mix');
      return;
    }
    
    const soundSettings = getCurrentSoundSettings();
    
    if (isEditing && editMixId) {
      updateMix(editMixId, mixName, soundSettings);
    } else {
      createMix(mixName, soundSettings);
    }
    
    // Reset form
    setMixName('');
    setIsEditing(false);
    setEditMixId(null);
  };

  // Handle editing an existing mix
  const handleEditMix = (mix: SoundMix) => {
    setMixName(mix.name);
    setIsEditing(true);
    setEditMixId(mix.id);
    setShowMixList(false);
  };

  // Handle loading a mix
  const handleLoadMix = (mix: SoundMix) => {
    applyMix(mix);
    setShowMixList(false);
  };

  // Handle deleting a mix
  const handleDeleteMix = (mixId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the mix from being loaded
    
    if (window.confirm('Are you sure you want to delete this mix?')) {
      deleteMix(mixId);
    }
  };

  return (
    <div className="mix-controls">
      <h3>Sound Mixes</h3>
      
      <div className="mix-form">
        <input
          type="text"
          placeholder="Enter mix name"
          value={mixName}
          onChange={(e) => setMixName(e.target.value)}
        />
        
        <button 
          className="save-mix-btn"
          onClick={handleSaveMix}
          disabled={activeSounds.size === 0 || !mixName.trim()}
        >
          {isEditing ? 'Update Mix' : 'Save Mix'}
        </button>
        
        <button 
          className="show-mixes-btn"
          onClick={() => setShowMixList(!showMixList)}
        >
          {showMixList ? 'Hide Mixes' : 'Show Saved Mixes'}
        </button>
      </div>
      
      {showMixList && (
        <div className="mix-list">
          <h4>Saved Mixes</h4>
          
          {mixes.length === 0 ? (
            <p className="empty-message">No saved mixes yet</p>
          ) : (
            <ul>
              {mixes.map(mix => (
                <li 
                  key={mix.id}
                  className={activeMixId === mix.id ? 'active' : ''}
                  onClick={() => handleLoadMix(mix)}
                >
                  <div className="mix-info">
                    <span className="mix-name">{mix.name}</span>
                    <span className="mix-date">
                      {mix.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mix-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMix(mix);
                      }}
                    >
                      Edit
                    </button>
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      <ShareMixButton mix={mix} text="Share" className="share-btn" />
                    </div>
                    
                    <button 
                      className="delete-btn"
                      onClick={(e) => handleDeleteMix(mix.id, e)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}