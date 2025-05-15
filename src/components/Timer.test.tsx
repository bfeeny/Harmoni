import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import Timer from './Timer';

describe('Timer Component', () => {
  const mockProps = {
    onTimerComplete: vi.fn(),
    onTimerUpdate: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should render the timer with default settings', () => {
    render(<Timer {...mockProps} />);
    
    // Timer display should show 30:00 by default (30 minutes)
    expect(screen.getByText('30:00')).toBeInTheDocument();
    
    // Should have duration and fade-out selectors
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fade-out/i)).toBeInTheDocument();
    
    // Should have Start and Reset buttons
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
  
  it('should update timer duration when changed', () => {
    render(<Timer {...mockProps} />);
    
    // Change the duration to 15 minutes
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '15' } });
    
    // Timer display should update to 15:00
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });
  
  it('should start the timer when Start button is clicked', () => {
    render(<Timer {...mockProps} />);
    
    // Set a shorter duration for testing
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '1' } });
    
    // Find the Start button
    const startButtons = screen.getAllByRole('button');
    const startButton = startButtons.find(btn => btn.textContent === 'Start');
    expect(startButton).toBeDefined();
    
    // Click the Start button
    if (startButton) {
      fireEvent.click(startButton);
    }
    
    // Verify the UI has updated after clicking the button
    const buttons = screen.getAllByRole('button');
    const pauseButton = buttons.find(btn => btn.textContent === 'Pause');
    expect(pauseButton).toBeDefined();
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    
    // Timer should update to 00:59
    expect(screen.getByText('00:59')).toBeInTheDocument();
    
    // onTimerUpdate should have been called
    expect(mockProps.onTimerUpdate).toHaveBeenCalledWith(59);
  });
  
  it('should pause the timer when Pause button is clicked', () => {
    render(<Timer {...mockProps} />);
    
    // Set a shorter duration for testing
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '1' } });
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    
    // Pause the timer
    fireEvent.click(screen.getByText('Pause'));
    
    // The button should change to "Start"
    expect(screen.getByText('Start')).toBeInTheDocument();
    
    // Advance time again
    vi.advanceTimersByTime(1000);
    
    // Timer should not change, still at 00:59
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });
  
  it('should reset the timer when Reset button is clicked', () => {
    render(<Timer {...mockProps} />);
    
    // Set a shorter duration for testing
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '1' } });
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    
    // Now timer should be at 00:59
    expect(screen.getByText('00:59')).toBeInTheDocument();
    
    // Reset the timer
    fireEvent.click(screen.getByText('Reset'));
    
    // Timer should be reset to 01:00
    expect(screen.getByText('01:00')).toBeInTheDocument();
    
    // The button should be "Start"
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
  
  it('should complete the timer and call onTimerComplete with fade-out duration', () => {
    render(<Timer {...mockProps} />);
    
    // Set a very short duration for testing
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '1' } });
    
    // Set fade-out duration to 10 seconds
    fireEvent.change(screen.getByLabelText(/fade-out/i), { target: { value: '10' } });
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Advance time to just before the fade-out should start (50 seconds)
    vi.advanceTimersByTime(50 * 1000);
    
    // Timer should show 00:10 now
    expect(screen.getByText('00:10')).toBeInTheDocument();
    
    // Advance to the fade-out point
    vi.advanceTimersByTime(1000);
    
    // Should show "Fading out..." message
    expect(screen.getByText('Fading out...')).toBeInTheDocument();
    expect(screen.getByText('00:09')).toHaveClass('fading');
    
    // Advance to the end of the timer
    vi.advanceTimersByTime(9 * 1000);
    
    // onTimerComplete should have been called with the fade-out duration in ms
    expect(mockProps.onTimerComplete).toHaveBeenCalledWith(10 * 1000);
  });
  
  it('should keep the timer enabled when the fade-out starts', () => {
    render(<Timer {...mockProps} />);
    
    // Set a very short duration for testing
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '1' } });
    
    // Set fade-out duration to 30 seconds
    fireEvent.change(screen.getByLabelText(/fade-out/i), { target: { value: '30' } });
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Advance time to just before the fade-out should start (30 seconds)
    vi.advanceTimersByTime(30 * 1000);
    
    // Timer should show 00:30 now
    expect(screen.getByText('00:30')).toBeInTheDocument();
    
    // Advance to the fade-out point
    vi.advanceTimersByTime(1000);
    
    // Should show "Fading out..." message and still have "Pause" button
    expect(screen.getByText('Fading out...')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Advance 10 more seconds
    vi.advanceTimersByTime(10 * 1000);
    
    // Timer should still be running and counting down
    expect(screen.getByText('00:19')).toBeInTheDocument();
  });
  
  it('should disable duration and fade-out selectors while timer is active', () => {
    render(<Timer {...mockProps} />);
    
    // Duration and fade-out selectors should be enabled initially
    expect(screen.getByLabelText(/duration/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/fade-out/i)).not.toBeDisabled();
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Now they should be disabled
    expect(screen.getByLabelText(/duration/i)).toBeDisabled();
    expect(screen.getByLabelText(/fade-out/i)).toBeDisabled();
    
    // Pause the timer
    fireEvent.click(screen.getByText('Pause'));
    
    // Should still be disabled until reset
    expect(screen.getByLabelText(/duration/i)).toBeDisabled();
    expect(screen.getByLabelText(/fade-out/i)).toBeDisabled();
    
    // Reset the timer
    fireEvent.click(screen.getByText('Reset'));
    
    // Now they should be enabled again
    expect(screen.getByLabelText(/duration/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/fade-out/i)).not.toBeDisabled();
  });
  
  it('should have proper CSS classes for different timer states', () => {
    render(<Timer {...mockProps} />);
    
    // Set a very short duration for testing
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '1' } });
    
    // Set fade-out duration to 30 seconds
    fireEvent.change(screen.getByLabelText(/fade-out/i), { target: { value: '30' } });
    
    // Get the timer display element
    const timerDisplay = screen.getByText('01:00').closest('.timer-display');
    expect(timerDisplay).toBeInTheDocument();
    
    // Initially no classes
    expect(timerDisplay).not.toHaveClass('fading');
    expect(timerDisplay).not.toHaveClass('ending');
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Advance to 45 seconds (15 seconds left)
    vi.advanceTimersByTime(45 * 1000);
    
    // Should not have any special classes yet
    expect(timerDisplay).not.toHaveClass('fading');
    expect(timerDisplay).not.toHaveClass('ending');
    
    // Advance to 50 seconds (10 seconds left - less than a minute)
    vi.advanceTimersByTime(5 * 1000);
    
    // Should have the 'ending' class
    expect(timerDisplay).not.toHaveClass('fading');
    expect(timerDisplay).toHaveClass('ending');
    
    // Advance to 30 seconds (the fade-out point)
    vi.advanceTimersByTime(20 * 1000);
    
    // Should have the 'fading' class
    expect(timerDisplay).toHaveClass('fading');
    expect(timerDisplay).not.toHaveClass('ending');
  });
});