import React from 'react';

export enum TabId {
  SoundLibrary = 'sound-library',
  FreesoundSearch = 'freesound-search'
}

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="tab-navigation">
      <button 
        className={`tab-button ${activeTab === TabId.SoundLibrary ? 'active' : ''}`}
        onClick={() => onTabChange(TabId.SoundLibrary)}
      >
        Sound Library
      </button>
      
      <button 
        className={`tab-button ${activeTab === TabId.FreesoundSearch ? 'active' : ''}`}
        onClick={() => onTabChange(TabId.FreesoundSearch)}
      >
        Search Freesound
      </button>
    </div>
  );
}