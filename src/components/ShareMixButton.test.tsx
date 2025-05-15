import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import ShareMixButton from './ShareMixButton';
import { shareMix } from '../utils/shareUtils';

// Mock the shareMix utility
vi.mock('../utils/shareUtils', () => ({
  shareMix: vi.fn(),
}));

describe('ShareMixButton', () => {
  const mockMix = {
    id: 'mix_123',
    name: 'Test Mix',
    sounds: [
      { soundId: 'sound1', volume: 0.5, enabled: true },
      { soundId: 'sound2', volume: 0.7, enabled: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with default text', () => {
    render(<ShareMixButton mix={mockMix} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Share Mix');
    expect(button).toHaveClass('share-btn');
  });

  it('should render with custom text and class', () => {
    render(
      <ShareMixButton 
        mix={mockMix} 
        text="Custom Share Text" 
        className="custom-class" 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom Share Text');
    expect(button).toHaveClass('custom-class');
  });

  it('should show success message when sharing succeeds', async () => {
    // Mock successful share with immediately resolved promise
    vi.mocked(shareMix).mockImplementation(() => Promise.resolve({
      success: true,
      message: 'Mix shared successfully!',
    }));
    
    const { user } = render(<ShareMixButton mix={mockMix} />);
    
    // Click the share button
    await user.click(screen.getByRole('button'));
    
    // Button should show loading state
    expect(screen.getByRole('button')).toHaveTextContent('Sharing...');
    
    // Run all pending timers and promises
    await vi.runAllTimersAsync();
    
    // Wait for the share to complete and success message to be displayed
    await waitFor(() => {
      expect(shareMix).toHaveBeenCalledWith(mockMix);
      expect(screen.getByText('Mix shared successfully!')).toBeInTheDocument();
    });
    
    // Success message should have the right class
    expect(screen.getByText('Mix shared successfully!')).toHaveClass('success');
    
    // Advance time by 3 seconds
    vi.advanceTimersByTime(3000);
    
    // Run any pending promises
    await vi.runAllTimersAsync();
    
    // Message should be gone
    expect(screen.queryByText('Mix shared successfully!')).not.toBeInTheDocument();
  }, 10000);

  it('should show error message when sharing fails', async () => {
    // Mock failed share with immediately resolved promise
    vi.mocked(shareMix).mockImplementation(() => Promise.resolve({
      success: false,
      message: 'Failed to share mix',
    }));
    
    const { user } = render(<ShareMixButton mix={mockMix} />);
    
    // Click the share button
    await user.click(screen.getByRole('button'));
    
    // Run all pending timers and promises
    await vi.runAllTimersAsync();
    
    // Wait for the share to complete and error message to be displayed
    await waitFor(() => {
      expect(shareMix).toHaveBeenCalledWith(mockMix);
      expect(screen.getByText('Failed to share mix')).toBeInTheDocument();
      expect(screen.getByText('Failed to share mix')).toHaveClass('error');
    });
  }, 10000);

  it('should handle unexpected errors', async () => {
    // Mock a thrown error
    vi.mocked(shareMix).mockImplementation(() => Promise.reject(new Error('Unexpected error')));
    
    const { user } = render(<ShareMixButton mix={mockMix} />);
    
    // Click the share button
    await user.click(screen.getByRole('button'));
    
    // Run all pending timers and promises
    await vi.runAllTimersAsync();
    
    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.getByText('Failed to share mix')).toBeInTheDocument();
      expect(screen.getByText('Failed to share mix')).toHaveClass('error');
    });
  }, 10000);

  it('should disable the button during sharing', async () => {
    // Mock a delayed share with controlled promise
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(shareMix).mockImplementation(() => promise as Promise<any>);
    
    const { user } = render(<ShareMixButton mix={mockMix} />);
    
    // Click the share button
    await user.click(screen.getByRole('button'));
    
    // Button should be disabled immediately
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('loading');
    
    // Resolve the promise
    resolvePromise!({
      success: true,
      message: 'Mix shared successfully!'
    });
    
    // Run all pending timers and promises
    await vi.runAllTimersAsync();
    
    // Button should be enabled again
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).not.toHaveClass('loading');
    });
  }, 10000);
});