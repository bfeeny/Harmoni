/**
 * FreesoundService - Handles communication with the Freesound API
 * 
 * The Freesound API requires authentication via OAuth2 or API key.
 * See: https://freesound.org/docs/api/
 */

export interface FreesoundSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
  filter?: string; // Advanced filtering options
  sort?: 'score' | 'duration_desc' | 'duration_asc' | 'created_desc' | 'created_asc' | 'downloads_desc' | 'downloads_asc' | 'rating_desc' | 'rating_asc';
  fields?: string[]; // Specific fields to include in the response
}

export interface FreesoundSoundInfo {
  id: number;
  name: string;
  tags: string[];
  description: string;
  duration: number;
  license: string;
  username: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
    'preview-hq-ogg': string;
    'preview-lq-ogg': string;
  };
  images: {
    waveform_m: string;
    waveform_l: string;
    spectral_m: string;
    spectral_l: string;
  };
  download?: string; // Only available with OAuth2 authentication
  bookmark?: string; // Only available with OAuth2 authentication
  url: string;
}

export interface FreesoundSearchResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: FreesoundSoundInfo[];
}

export class FreesoundService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://freesound.org/apiv2';
  private readonly clientId: string;
  
  constructor(apiKey: string, clientId: string) {
    this.apiKey = apiKey;
    this.clientId = clientId;
  }
  
  /**
   * Search for sounds using the Freesound API
   */
  async searchSounds(params: FreesoundSearchParams): Promise<FreesoundSearchResult> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', params.query);
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }
    
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }
    
    if (params.fields && params.fields.length > 0) {
      queryParams.append('fields', params.fields.join(','));
    }
    
    const response = await fetch(`${this.baseUrl}/search/text/?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Token ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Freesound API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get detailed information about a specific sound
   */
  async getSoundInfo(soundId: number): Promise<FreesoundSoundInfo> {
    const response = await fetch(`${this.baseUrl}/sounds/${soundId}/`, {
      headers: {
        'Authorization': `Token ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Freesound API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get a download URL for a sound
   * Note: This requires OAuth2 authentication for download functionality
   */
  getDownloadUrl(soundId: number): string {
    return `${this.baseUrl}/sounds/${soundId}/download/`;
  }
  
  /**
   * Get OAuth2 authorization URL
   */
  getAuthorizationUrl(): string {
    return `https://freesound.org/apiv2/oauth2/authorize/?client_id=${this.clientId}&response_type=code`;
  }
  
  /**
   * Convert a Freesound sound to our app's Sound format
   */
  convertToAppSound(freesoundInfo: FreesoundSoundInfo): any {
    // Determine the most appropriate category based on tags
    let category = 'nature'; // Default category
    
    const tags = freesoundInfo.tags.map(tag => tag.toLowerCase());
    
    if (tags.some(tag => ['nature', 'rain', 'water', 'forest', 'wind', 'thunder', 'birds'].includes(tag))) {
      category = 'nature';
    } else if (tags.some(tag => ['ambient', 'background', 'cafe', 'fireplace', 'city'].includes(tag))) {
      category = 'ambient';
    } else if (tags.some(tag => ['noise', 'white', 'pink', 'brown'].includes(tag))) {
      category = 'white';
    } else if (tags.some(tag => ['meditation', 'zen', 'yoga', 'bowl', 'chant', 'om'].includes(tag))) {
      category = 'meditation';
    }
    
    return {
      id: `freesound_${freesoundInfo.id}`,
      name: freesoundInfo.name,
      category,
      description: freesoundInfo.description.slice(0, 120) + (freesoundInfo.description.length > 120 ? '...' : ''),
      filepath: freesoundInfo.previews['preview-hq-mp3'],
      iconPath: freesoundInfo.images.waveform_m,
      source: {
        id: freesoundInfo.id,
        url: freesoundInfo.url,
        license: freesoundInfo.license,
        username: freesoundInfo.username
      }
    };
  }
}

// Create a placeholder service instance
// In a real app, you would load API keys from environment variables
export const freesoundService = new FreesoundService(
  'YOUR_API_KEY_HERE', 
  'YOUR_CLIENT_ID_HERE'
);