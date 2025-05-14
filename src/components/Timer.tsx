import { useState, useEffect } from 'react';
import { TimerSettings } from '../utils/types';

interface TimerProps {
  onTimerComplete: () => void;
  onTimerUpdate: (timeRemaining: number) => void;
}

export default function Timer({ onTimerComplete, onTimerUpdate }: TimerProps) {
  const [settings, setSettings] = useState<TimerSettings>({
    duration: 30, // 30 minutes default
    fadeOutDuration: 30, // 30 seconds default
    enabled: false,
  });
  
  const [timeRemaining, setTimeRemaining] = useState(settings.duration * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Handle timer duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = parseInt(e.target.value, 10);
    setSettings({
      ...settings,
      duration: newDuration,
    });
    setTimeRemaining(newDuration * 60);
  };
  
  // Start the timer
  const startTimer = () => {
    if (settings.duration > 0) {
      setIsActive(true);
      setSettings({
        ...settings,
        enabled: true,
      });
    }
  };
  
  // Stop the timer
  const stopTimer = () => {
    setIsActive(false);
    setSettings({
      ...settings,
      enabled: false,
    });
  };
  
  // Reset the timer
  const resetTimer = () => {
    stopTimer();
    setTimeRemaining(settings.duration * 60);
  };
  
  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        const newTimeRemaining = timeRemaining - 1;
        setTimeRemaining(newTimeRemaining);
        onTimerUpdate(newTimeRemaining);
        
        // Check if timer is complete
        if (newTimeRemaining <= 0) {
          if (interval) clearInterval(interval);
          setIsActive(false);
          onTimerComplete();
        }
      }, 1000);
    } else if (isActive && timeRemaining <= 0) {
      setIsActive(false);
      onTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, onTimerComplete, onTimerUpdate]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="timer">
      <h3>Sleep Timer</h3>
      
      <div className="timer-display">
        <span className="time-remaining">{formatTime(timeRemaining)}</span>
      </div>
      
      <div className="timer-controls">
        <select 
          value={settings.duration} 
          onChange={handleDurationChange}
          disabled={isActive}
        >
          <option value="5">5 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </select>
        
        <div className="timer-buttons">
          {!isActive ? (
            <button onClick={startTimer}>Start</button>
          ) : (
            <button onClick={stopTimer}>Pause</button>
          )}
          <button onClick={resetTimer}>Reset</button>
        </div>
      </div>
    </div>
  );
}