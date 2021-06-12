import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';
import { RecordingManager } from '../recording-manager';

import Header from '../components/Header';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';

const MenuBar = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const recordingManager = useRef<RecordingManager | null>(null);

  // Current way doesn't seem ideal as useEffect runs on every component re-render.
  // The ideal behaviour would be to execute this effect only once, then followed by a
  // re-render so there would be an opportunity to use data from recordingManager to
  // update the UI right away.
  useEffect(() => {
    ipcRenderer.on('init-menubar', (_event, applicationDir: string) => {
      recordingManager.current = new RecordingManager(applicationDir);
      setIsLoading(false);
    });
  });

  return isLoading ? (
    <h3>Loading...</h3>
  ) : (
    <div className="container mx-auto px-4 py-3 w-full bg-white">
      <Header />
      <ListHeader />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListHeader />
      <ListItem />
      <ListItem />
      <ListItem />
    </div>
  );
};

export default MenuBar;
