import { useState } from 'react';
import { SoundMix } from '../utils/types';
import { shareMix } from '../utils/shareUtils';

interface ShareMixButtonProps {
  mix: SoundMix;
  text?: string;
  className?: string;
}

export default function ShareMixButton({ 
  mix, 
  text = 'Share Mix', 
  className = 'share-btn' 
}: ShareMixButtonProps) {
  const [shareStatus, setShareStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'none';
  }>({
    message: '',
    type: 'none'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleShare = async () => {
    setIsLoading(true);
    
    try {
      const result = await shareMix(mix);
      
      setShareStatus({
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShareStatus({ message: '', type: 'none' });
      }, 3000);
    } catch (error) {
      setShareStatus({
        message: 'Failed to share mix',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="share-button-container">
      <button 
        className={`${className} ${isLoading ? 'loading' : ''}`}
        onClick={handleShare}
        disabled={isLoading}
      >
        {isLoading ? 'Sharing...' : text}
      </button>
      
      {shareStatus.type !== 'none' && (
        <div className={`share-status ${shareStatus.type}`}>
          {shareStatus.message}
        </div>
      )}
    </div>
  );
}