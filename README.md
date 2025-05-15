# Harmoni

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bfeeny/harmoni/ci.yml?branch=main)
![GitHub license](https://img.shields.io/github/license/bfeeny/harmoni)

A modern web app that generates personalized ambient soundscapes for focus, relaxation, and sleep.

## Features

- Mix multiple sound sources with individual volume controls
- Save and share custom sound mixes
- Timer functionality for sleep/meditation
- Beautiful, responsive audio visualization
- Integration with Freesound API for endless sound possibilities
- Optional focus timer/pomodoro integration

## Project Structure

```
harmoni/
├── public/         # Static files
│   ├── sounds/     # Sound files
│   └── icons/      # Icons for sounds
├── src/            # Source code
│   ├── assets/     # Images, fonts, etc.
│   ├── components/ # React components
│   ├── data/       # Data files
│   ├── hooks/      # React custom hooks
│   ├── services/   # Audio and other services
│   ├── styles/     # CSS files
│   └── utils/      # Utility functions and types
├── .github/        # GitHub configurations
│   ├── workflows/  # GitHub Actions
│   └── ISSUE_TEMPLATE/ # Issue templates
├── .gitignore      # Git ignore file
├── CLAUDE.md       # Project guidance for Claude
├── CONTRIBUTING.md # Contributing guidelines
├── README.md       # Project documentation
└── TODO.md         # Project roadmap and tasks
```

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd harmoni
   ```

2. Install dependencies
   ```
   npm install
   ```

3. (Optional) Set up Freesound API
   - Create an account at [Freesound.org](https://freesound.org/)
   - Create an API application in your Freesound account
   - Copy your API key and client ID
   - Edit the FreesoundService.ts file to replace the placeholder values with your actual API key and client ID

4. Start the development server
   ```
   npm start
   ```

The app will be available at http://localhost:3000.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode 
- `npm test -- --coverage` - Run tests with coverage reporting
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and fix issues automatically
- `npm run format` - Format code with Prettier

## How It Works

Harmoni uses the Web Audio API to load, process, and mix various ambient sounds. Users can:

1. Browse sounds by category (nature, ambient, white noise, meditation)
2. Search and import sounds from Freesound.org via the API
3. Create personalized mixes with multiple sounds
4. Adjust volume levels for each sound
5. Enjoy visual representation of their soundscape
6. Set sleep timers for automatic fade-out
7. Save and load custom mixes

### Audio Visualization

Harmoni features real-time audio visualization that responds to the playing sounds:

- **Single Sound Mode**: When only one sound is playing, the visualization shows a circular waveform that pulses with the audio.
- **Multiple Sound Mode**: When multiple sounds are playing, the visualization displays a dynamic particle field where each sound contributes its own particles and connections.
- **Interactive Controls**: Users can show or hide the visualization with a simple toggle.

The visualization is built using:
- Web Audio API's AnalyserNode to extract frequency data
- HTML5 Canvas for rendering
- Dynamic color schemes based on the number of active sounds

### Freesound Integration

Harmoni integrates with the [Freesound API](https://freesound.org/docs/api/) to provide access to a vast library of Creative Commons licensed sounds. This significantly expands the available sounds beyond the built-in library.

To use the Freesound integration:

1. Click on the "Search Freesound" tab
2. Enter search terms for ambient sounds
3. Listen to previews of search results
4. Add sounds you like to your Harmoni library
5. Use the added sounds in your mixes

Note: Freesound API functionality requires setting up API credentials as described in the Installation section.

### Testing Framework

Harmoni uses a robust testing framework to ensure code quality and reliability:

- **Vitest**: A fast and lightweight test runner compatible with Vite and React
- **React Testing Library**: Testing utilities for React components
- **JSDOM**: DOM implementation for Node.js used in the tests

The test suite covers:
- Component rendering and interaction
- Audio service functionality
- State management
- Integration between components

For more details on testing, see the [Testing Documentation](TESTING.md).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

See the [TODO list](TODO.md) for current development priorities.

## License

This project is licensed under the MIT License - see the LICENSE file for details.