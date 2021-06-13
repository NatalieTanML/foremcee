import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';
import { Recording, RecordingManager } from '../recording-manager';

import Header from '../components/Header';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';

const MenuBar = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const recordingManager = useRef<RecordingManager | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [groupRecordings, setGroupRecordings] = useState<
    Record<string, Recording[]>
  >({});

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

  useEffect(() => {
    const g = recordings.reduce((groups, rec) => {
      const key = rec.datetime.toDateString();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(rec);
      return groups;
    }, {} as Record<string, Recording[]>);
    setGroupRecordings(g);
  }, [recordings]);

  return isLoading ? (
    <div className="container p-20 flex flex-col items-center justify-center content-center">
      <div className="self-center">
        <IconContext.Provider
          value={{ className: 'animate-spin', size: '2em' }}
        >
          <CgSpinner />
        </IconContext.Provider>
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-3 w-full bg-white">
      <Header />
      {Object.entries(groupRecordings).map(([k, v]) => (
        <>
          <ListHeader key={k} title={k} />
          {v.map((rec) => (
            <ListItem key={rec.datetime.getTime()} rec={rec} />
          ))}
        </>
      ))}
    </div>
  );
};

export default MenuBar;
