import { useRef, useEffect } from 'react';
import { audioService } from '../services/AudioService';

interface AudioVisualizationProps {
  activeSounds: Set<string>;
  soundVolumes: Map<string, number>;
}

export default function AudioVisualization({ activeSounds, soundVolumes }: AudioVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Get the audio context from the audio service
    const audioContext = audioService.getAudioContext();
    if (!audioContext) return;
    
    // Create an analyzer node
    const analyzerNode = audioContext.createAnalyser();
    analyzerNode.fftSize = 256;
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Connect the analyzer to the master gain node
    audioService.connectAnalyzer(analyzerNode);
    
    // Set up canvas and context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Make sure canvas dimensions match its display size
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      ctx.translate(rect.width / 2, rect.height / 2);
    };
    
    // Call initially and on resize
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    // Colors array for different sound categories
    const colors = [
      '#646cff', // Primary blue
      '#ff6464', // Red
      '#64ff8c', // Green
      '#ffb164', // Orange
      '#ff64c8', // Pink
      '#64f0ff'  // Cyan
    ];
    
    // Animation function
    const draw = () => {
      if (!ctx) return;
      
      // Clear canvas
      const canvasWidth = canvas.width / window.devicePixelRatio;
      const canvasHeight = canvas.height / window.devicePixelRatio;
      ctx.clearRect(-canvasWidth/2, -canvasHeight/2, canvasWidth, canvasHeight);
      
      // Get frequency data
      analyzerNode.getByteFrequencyData(dataArray);
      
      // Only draw if there are active sounds
      if (activeSounds.size > 0) {
        // Different visualization patterns based on number of active sounds
        if (activeSounds.size === 1) {
          // Single sound - circle wave
          drawCircleWave(ctx, dataArray, colors[0], canvasWidth, canvasHeight);
        } else {
          // Multiple sounds - particle field
          drawParticleField(ctx, dataArray, colors, canvasWidth, canvasHeight, activeSounds.size);
        }
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(draw);
    
    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', setupCanvas);
      audioService.disconnectAnalyzer(analyzerNode);
      analyzerNode.disconnect();
    };
  }, []);
  
  // Effect to update visualization based on active sounds
  useEffect(() => {
    // This effect can be used to modify the visualization when
    // active sounds change, but the core visualization is handled
    // through the analyzer node in the main effect
  }, [activeSounds, soundVolumes]);
  
  // Draw a circular waveform
  const drawCircleWave = (
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    color: string,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const bufferLength = dataArray.length;
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.4;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255.0;
      const radius = maxRadius * (0.7 + value * 0.3);
      const angle = (i / bufferLength) * Math.PI * 2;
      
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    
    // Add a glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Add center circle with pulse
    const bassValue = (dataArray[1] + dataArray[2] + dataArray[3]) / (3 * 255);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius * 0.1 * (1 + bassValue * 0.5), 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Draw a particle field effect
  const drawParticleField = (
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    colors: string[],
    canvasWidth: number,
    canvasHeight: number,
    soundCount: number
  ) => {
    const bufferLength = dataArray.length;
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.45;
    const particleCount = Math.min(bufferLength, 64);
    const angleStep = (Math.PI * 2) / particleCount;
    
    // Divide frequency into ranges for each sound
    const rangeSize = Math.floor(bufferLength / soundCount);
    
    for (let s = 0; s < soundCount; s++) {
      const color = colors[s % colors.length];
      const startFreq = s * rangeSize;
      const endFreq = (s + 1) * rangeSize;
      
      // Calculate average intensity for this sound's frequency range
      let avgIntensity = 0;
      for (let i = startFreq; i < endFreq; i++) {
        if (i < bufferLength) {
          avgIntensity += dataArray[i] / 255.0;
        }
      }
      avgIntensity /= rangeSize;
      
      // Draw particles for this sound
      for (let i = 0; i < particleCount; i++) {
        // Use frequency data to determine particle radius and position
        const freqIndex = startFreq + (i % rangeSize);
        const value = freqIndex < bufferLength ? dataArray[freqIndex] / 255.0 : 0;
        
        // Base position on angle with some variation
        const noiseOffset = Math.sin(Date.now() * 0.001 + i * 0.3) * 0.2;
        const angle = i * angleStep + noiseOffset;
        
        // Distance from center based on value and sound number
        const distance = maxRadius * (0.3 + value * 0.7) * (0.7 + s * 0.1);
        
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);
        
        // Particle size based on value
        const size = 3 + value * 8;
        
        // Draw particle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        if (value > 0.6) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      
      // Draw connecting lines between nearby particles if intensity is high
      if (avgIntensity > 0.4) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = avgIntensity * 0.3;
        ctx.beginPath();
        
        const lineThreshold = maxRadius * 0.3; // Only connect particles within this distance
        
        for (let i = 0; i < particleCount; i++) {
          const freqIndex1 = startFreq + (i % rangeSize);
          const value1 = freqIndex1 < bufferLength ? dataArray[freqIndex1] / 255.0 : 0;
          
          const angle1 = i * angleStep + Math.sin(Date.now() * 0.001 + i * 0.3) * 0.2;
          const distance1 = maxRadius * (0.3 + value1 * 0.7) * (0.7 + s * 0.1);
          
          const x1 = distance1 * Math.cos(angle1);
          const y1 = distance1 * Math.sin(angle1);
          
          for (let j = i + 1; j < particleCount; j++) {
            const freqIndex2 = startFreq + (j % rangeSize);
            const value2 = freqIndex2 < bufferLength ? dataArray[freqIndex2] / 255.0 : 0;
            
            const angle2 = j * angleStep + Math.sin(Date.now() * 0.001 + j * 0.3) * 0.2;
            const distance2 = maxRadius * (0.3 + value2 * 0.7) * (0.7 + s * 0.1);
            
            const x2 = distance2 * Math.cos(angle2);
            const y2 = distance2 * Math.sin(angle2);
            
            // Calculate distance between particles
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Connect with line if close enough
            if (dist < lineThreshold) {
              const opacity = (1 - dist / lineThreshold) * avgIntensity;
              ctx.globalAlpha = opacity * 0.3;
              ctx.lineWidth = 1;
              
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    }
  };
  
  return (
    <div className="audio-visualization">
      <canvas 
        ref={canvasRef} 
        className="visualization-canvas"
      />
    </div>
  );
}