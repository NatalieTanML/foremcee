import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';
import { Recording, RecordingManager } from '../recording-manager';

import Header from '../components/Header';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';

const MenuBar = () => {
  const [
    recordingManager,
    setRecordingManager,
  ] = useState<RecordingManager | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [groupRecordings, setGroupRecordings] = useState<
    Record<string, Recording[]>
  >({});

  useEffect(() => {
    ipcRenderer.on('init-menubar', async (_event, applicationDir: string) => {
      setRecordingManager(new RecordingManager(applicationDir));
    });
  });

  useEffect(() => {
    // The purpose of having this cancel variable is to prevent memory leaks
    // by using it in the callback and the cleanup function.
    // Ref: https://dev.to/jexperton/how-to-fix-the-react-memory-leak-warning-d4i
    let cancel = false;
    recordingManager
      ?.getRecordings()
      .then((recs) => {
        // eslint-disable-next-line promise/always-return
        if (cancel) return;
        setRecordings(recs);
      })
      .catch(console.error);
    return () => {
      cancel = true;
    };
  });

  useEffect(() => {
    setGroupRecordings(
      recordings.reduce((groups, rec) => {
        const key = rec.datetime.toDateString();
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(rec);
        return groups;
      }, {} as Record<string, Recording[]>)
    );
  }, [recordings]);

  return recordingManager === null ? (
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
            <ListItem
              key={rec.datetime.getTime()}
              rec={rec}
              recM={recordingManager}
            />
          ))}
        </>
      ))}
    </div>
  );
};

export default MenuBar;
