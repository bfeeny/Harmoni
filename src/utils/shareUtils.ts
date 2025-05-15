/**
 * Utility functions for sharing mixes
 */
import { SoundMix, SoundSetting } from './types';

/**
 * Encode a mix to a shareable string
 */
export function encodeMixToString(mix: SoundMix): string {
  // Create a simplified version of the mix without dates
  const simplifiedMix = {
    name: mix.name,
    sounds: mix.sounds
  };
  
  // Convert to JSON and encode as base64
  const jsonStr = JSON.stringify(simplifiedMix);
  
  // Base64 encode and make URL-safe
  return btoa(jsonStr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a shared mix string to a mix object
 */
export function decodeStringToMix(encoded: string): { name: string; sounds: SoundSetting[] } | null {
  try {
    // Make base64 URL-safe format back to regular base64
    const base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add back any missing padding
    const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    // Decode from base64 to JSON string
    const jsonStr = atob(paddedBase64);
    
    // Parse JSON
    const mixData = JSON.parse(jsonStr) as { name: string; sounds: SoundSetting[] };
    
    // Validate the structure
    if (!mixData.name || !Array.isArray(mixData.sounds)) {
      throw new Error('Invalid mix data structure');
    }
    
    return mixData;
  } catch (error) {
    console.error('Error decoding mix:', error);
    return null;
  }
}

/**
 * Generate a shareable URL for a mix
 */
export function generateShareableUrl(mix: SoundMix): string {
  const encodedMix = encodeMixToString(mix);
  return `${window.location.origin}?mix=${encodedMix}`;
}

/**
 * Extract a shared mix from URL if present
 */
export function extractSharedMixFromUrl(): { name: string; sounds: SoundSetting[] } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const mixParam = urlParams.get('mix');
  
  if (!mixParam) {
    return null;
  }
  
  return decodeStringToMix(mixParam);
}

/**
 * Share a mix using the Web Share API if available,
 * otherwise copy the URL to clipboard
 */
export async function shareMix(mix: SoundMix): Promise<{ success: boolean; message: string }> {
  const shareUrl = generateShareableUrl(mix);
  
  // Try to use the Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Harmoni Mix: ${mix.name}`,
        text: `Check out my custom sound mix "${mix.name}" on Harmoni!`,
        url: shareUrl
      });
      
      return {
        success: true,
        message: 'Mix shared successfully!'
      };
    } catch (error) {
      console.error('Error sharing:', error);
      
      // Fall back to clipboard if user cancelled
      if (error instanceof Error && error.name !== 'AbortError') {
        return await copyToClipboard(shareUrl);
      } else {
        return {
          success: false,
          message: 'Sharing was cancelled'
        };
      }
    }
  } else {
    // Web Share API not available, fall back to clipboard
    return await copyToClipboard(shareUrl);
  }
}

/**
 * Copy text to clipboard and return a status
 */
async function copyToClipboard(text: string): Promise<{ success: boolean; message: string }> {
  try {
    await navigator.clipboard.writeText(text);
    return {
      success: true,
      message: 'Shareable link copied to clipboard!'
    };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return {
      success: false,
      message: 'Failed to copy link to clipboard'
    };
  }
}