import { useState, useEffect } from 'react';
import { freesoundService, FreesoundSoundInfo, FreesoundSearchResult } from '../services/FreesoundService';
import { Sound } from '../utils/types';
import { audioService } from '../services/AudioService';

interface FreesoundSearchProps {
  onAddSound: (sound: Sound) => void;
}

export default function FreesoundSearch({ onAddSound }: FreesoundSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FreesoundSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewSoundId, setPreviewSoundId] = useState<number | null>(null);
  const [apiConfigured, setApiConfigured] = useState(false);

  // Check if API key is configured
  useEffect(() => {
    // This is a simplistic check - in production you'd verify this differently
    const isConfigured = freesoundService && 
                        freesoundService instanceof Object && 
                        !(freesoundService as any).apiKey.includes('YOUR_API_KEY');
    setApiConfigured(isConfigured);
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await freesoundService.searchSounds({
        query: searchQuery,
        page: currentPage,
        pageSize: 20,
        fields: ['id', 'name', 'tags', 'description', 'previews', 'images', 'duration', 'license', 'username', 'url'],
        sort: 'score'
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching Freesound:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Stop any previews
    stopPreview();
  };

  // Search when query changes or page changes
  useEffect(() => {
    if (searchQuery && apiConfigured) {
      handleSearch();
    }
  }, [currentPage, apiConfigured]);

  // Preview a sound
  const playPreview = async (sound: FreesoundSoundInfo) => {
    // Stop any currently playing preview
    stopPreview();
    
    try {
      // Create a temporary Audio element to play the preview
      const audio = new Audio(sound.previews['preview-hq-mp3']);
      audio.id = `preview-${sound.id}`;
      document.body.appendChild(audio);
      await audio.play();
      
      setPreviewSoundId(sound.id);
      
      // Remove the audio element when playback ends
      audio.addEventListener('ended', () => {
        document.body.removeChild(audio);
        setPreviewSoundId(null);
      });
    } catch (err) {
      console.error('Error playing preview:', err);
    }
  };

  // Stop preview
  const stopPreview = () => {
    if (previewSoundId) {
      const audioElement = document.getElementById(`preview-${previewSoundId}`) as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        document.body.removeChild(audioElement);
      }
      setPreviewSoundId(null);
    }
  };

  // Add a sound to the app's library
  const addSound = (freesoundInfo: FreesoundSoundInfo) => {
    const appSound = freesoundService.convertToAppSound(freesoundInfo);
    
    // Load the sound into the audio service
    audioService.loadSound(appSound.id, appSound.filepath)
      .then(() => {
        // Once loaded, add it to the app's library
        onAddSound(appSound);
      })
      .catch(err => {
        console.error('Error loading sound:', err);
      });
  };

  if (!apiConfigured) {
    return (
      <div className="freesound-search">
        <h3>Freesound Integration</h3>
        <div className="api-warning">
          <p>To enable Freesound integration, you need to:</p>
          <ol>
            <li>Register at <a href="https://freesound.org/" target="_blank" rel="noreferrer">Freesound.org</a></li>
            <li>Create an API application in your Freesound account</li>
            <li>Update the API key and client ID in the FreesoundService.ts file</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="freesound-search">
      <h3>Search Freesound</h3>
      
      <div className="search-form">
        <input 
          type="text"
          placeholder="Search for ambient sounds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <button 
          className="search-btn"
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {searchResults && (
        <div className="search-results">
          <div className="results-header">
            <p>Found {searchResults.count} sounds</p>
          </div>
          
          <ul className="results-list">
            {searchResults.results.map(sound => (
              <li key={sound.id} className="sound-result">
                <div className="sound-info">
                  <h4>{sound.name}</h4>
                  <p className="sound-description">{sound.description.slice(0, 100)}{sound.description.length > 100 ? '...' : ''}</p>
                  <p className="sound-meta">
                    <span>{Math.round(sound.duration)} seconds</span>
                    <span>By {sound.username}</span>
                    <span>License: {sound.license}</span>
                  </p>
                </div>
                
                <div className="sound-actions">
                  <button 
                    className={`preview-btn ${previewSoundId === sound.id ? 'active' : ''}`}
                    onClick={() => previewSoundId === sound.id ? stopPreview() : playPreview(sound)}
                  >
                    {previewSoundId === sound.id ? 'Stop' : 'Preview'}
                  </button>
                  
                  <button 
                    className="add-btn"
                    onClick={() => addSound(sound)}
                  >
                    Add to Harmoni
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="pagination">
            <button 
              disabled={!searchResults.previous}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            
            <span>Page {currentPage}</span>
            
            <button 
              disabled={!searchResults.next}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}