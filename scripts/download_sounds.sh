#!/bin/bash

# Create directories if they don't exist
mkdir -p ../public/sounds/nature
mkdir -p ../public/sounds/ambient
mkdir -p ../public/sounds/white
mkdir -p ../public/sounds/meditation

# Sample sounds to download (replace these URLs with actual free sound links)
# These are example URLs and need to be replaced with actual valid sound file URLs

echo "Downloading nature sounds..."
# Rain sound
curl -L "https://example.com/rain.mp3" -o "../public/sounds/nature/rain.mp3"
# Forest sound
curl -L "https://example.com/forest.mp3" -o "../public/sounds/nature/forest.mp3"
# Ocean waves sound
curl -L "https://example.com/ocean.mp3" -o "../public/sounds/nature/ocean.mp3"
# Thunder sound
curl -L "https://example.com/thunder.mp3" -o "../public/sounds/nature/thunder.mp3"

echo "Downloading ambient sounds..."
# Café sound
curl -L "https://example.com/cafe.mp3" -o "../public/sounds/ambient/cafe.mp3"
# Fireplace sound
curl -L "https://example.com/fireplace.mp3" -o "../public/sounds/ambient/fireplace.mp3"

echo "Downloading white noise..."
# White noise sound
curl -L "https://example.com/white-noise.mp3" -o "../public/sounds/white/white-noise.mp3"
# Brown noise sound
curl -L "https://example.com/brown-noise.mp3" -o "../public/sounds/white/brown-noise.mp3"
# Pink noise sound
curl -L "https://example.com/pink-noise.mp3" -o "../public/sounds/white/pink-noise.mp3"

echo "Downloading meditation sounds..."
# Singing bowl sound
curl -L "https://example.com/singing-bowl.mp3" -o "../public/sounds/meditation/singing-bowl.mp3"
# Om chant sound
curl -L "https://example.com/om-chant.mp3" -o "../public/sounds/meditation/om-chant.mp3"

echo "Sound downloads complete!"