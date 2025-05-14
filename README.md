# Harmoni

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bfeeny/harmoni/ci.yml?branch=main)
![GitHub license](https://img.shields.io/github/license/bfeeny/harmoni)

A modern web app that generates personalized ambient soundscapes for focus, relaxation, and sleep.

## Features

- Mix multiple sound sources with individual volume controls
- Save and share custom sound mixes
- Timer functionality for sleep/meditation
- Beautiful, minimalist visualization of the sounds
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

3. Start the development server
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
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and fix issues automatically
- `npm run format` - Format code with Prettier

## How It Works

Harmoni uses the Web Audio API to load, process, and mix various ambient sounds. Users can:

1. Browse sounds by category (nature, ambient, white noise, meditation)
2. Create personalized mixes with multiple sounds
3. Adjust volume levels for each sound
4. Set sleep timers for automatic fade-out
5. Save and share their favorite mixes

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

See the [TODO list](TODO.md) for current development priorities.

## License

This project is licensed under the MIT License - see the LICENSE file for details.