# Harmoni - TODO List

## Sound Assets
- [x] Add placeholder sound files to the public/sounds directory
  - [x] Nature sounds (rain, forest, ocean, thunder)
  - [x] Ambient sounds (café, fireplace)
  - [x] White noise variations (white, pink, brown)
  - [x] Meditation sounds (singing bowl, om chant)
- [x] Add SVG icons for each sound type
- [ ] Replace placeholder sounds with actual royalty-free audio files
  - [ ] Find appropriate, high-quality sound files
  - [ ] Ensure all sounds have proper licensing
  - [ ] Document sources in ASSETS.md

## Features
- [x] Implement save/load functionality for custom sound mixes
  - [x] Create MixService for managing mixes
  - [x] Create custom hook (useMixes) for React components
  - [x] Add local storage for mixes
  - [x] Add UI for naming and saving mixes
- [x] Integrate external sound sources
  - [x] Add Freesound API integration
  - [x] Create FreesoundService for API communication
  - [x] Create FreesoundSearch component for searching and adding sounds
  - [x] Implement useSoundLibrary hook for managing custom sounds
- [ ] Add audio visualization
  - [ ] Add a Canvas component for visualization
  - [ ] Implement visualization effects based on active sounds
- [ ] Implement fade out for timer
- [ ] Add sharing functionality for sound mixes

## Testing
- [ ] Add unit tests for components
- [ ] Add integration tests for audio functionality

## Documentation
- [x] Create ASSETS.md to document sound and icon sources
- [ ] Update README with complete setup instructions
  - [ ] Add Freesound API setup instructions
- [x] Add contributing guidelines

## Deployment
- [ ] Set up custom domain (if applicable)
- [ ] Ensure CI/CD pipeline is working correctly