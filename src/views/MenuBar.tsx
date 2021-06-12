import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Recording, RecordingManager } from '../recording-manager';

import Header from '../components/Header';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';

const MenuBar = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const recordingManager = useRef<RecordingManager | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);

  // Current way doesn't seem ideal as useEffect runs on every component re-render.
  // The ideal behaviour would be to execute this effect only once, then followed by a
  // re-render so there would be an opportunity to use data from recordingManager to
  // update the UI right away.
  useEffect(() => {
    ipcRenderer.on('init-menubar', async (_event, applicationDir: string) => {
      recordingManager.current = new RecordingManager(applicationDir);
      const files: Recording[] = await recordingManager.current.getRecordings();
      setRecordings(files);
      setIsLoading(false);
    });
  });

  return isLoading ? (
    <h3>Loading...</h3>
  ) : (
    <div className="container mx-auto px-4 py-3 w-full bg-white">
      <Header />
      {recordings.map((rec) => (
        <>
          <ListHeader
            key={rec.datetime.getTime()}
            title={rec.datetime.toDateString()}
          />
          <ListItem key={rec.datetime.getTime()} rec={rec} />
        </>
      ))}
    </div>
  );
};

export default MenuBar;
