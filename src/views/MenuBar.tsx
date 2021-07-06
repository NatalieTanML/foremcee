import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';
import {
  HiOutlineCog,
  HiSortAscending,
  HiSortDescending,
} from 'react-icons/hi';
import { Recording, RecordingManager } from '../recording-manager';

import Header from '../components/Header';
import Search from '../components/Search';
import IconButton from '../components/IconButton';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';

const MenuBar = ({
  recordingManager,
}: {
  recordingManager: RecordingManager | null;
}) => {
  const [recordings, setRecordings] = useState<Record<string, Recording[]>>({});
  const [defaultRecordings, setDefaultRecordings] = useState<Recording[]>([]);
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  const history = useHistory();

  const groupRecordingsByDate = (recs: Recording[]) => {
    return recs.reduce((groups, rec) => {
      const key = rec.datetime.toDateString();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(rec);
      return groups;
    }, {} as Record<string, Recording[]>);
  };

  const updateInput = async (inputString: string) => {
    const filtered = defaultRecordings.filter((recording) => {
      return recording.datetime
        .toLocaleDateString('en-US', { dateStyle: 'full' })
        .toLowerCase()
        .includes(inputString.toLowerCase());
    });
    setInput(inputString);
    setRecordings(groupRecordingsByDate(filtered));
  };

  useEffect(() => {
    // The purpose of having this cancel variable is to prevent memory leaks
    // by using it in the callback and the cleanup function.
    // Ref: https://dev.to/jexperton/how-to-fix-the-react-memory-leak-warning-d4i
    let cancel = false;
    recordingManager
      ?.getRecordings()
      .then((recs) => {
        // eslint-disable-next-line promise/always-return
        if (!cancel) {
          setDefaultRecordings(recs);
          setRecordings(
            groupRecordingsByDate(sortAscending ? recs.reverse() : recs)
          );
        }
      })
      .catch(console.error);
    return () => {
      cancel = true;
    };
  });
  // TODO: Fix this dependency issue. Including [] fixes search but breaks the fetching of the data & sort

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
    <div className="container mx-auto px-4 my-3 w-full bg-white">
      <Header
        title="Voice Notes"
        btnContent={<HiOutlineCog />}
        handleClick={() => history.push('/settings')}
      />
      <div className="flex flex-row mt-4 gap-x-3 items-center">
        <Search keyword={input} setKeyword={updateInput} />
        <IconButton
          onClick={() => setSortAscending(!sortAscending)}
          isLoading={false}
          addStyleName="text-indigo-500 bg-indigo-50 hover:text-white active:text-white hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none"
        >
          {sortAscending ? <HiSortAscending /> : <HiSortDescending />}
        </IconButton>
      </div>
      {Object.entries(recordings).map(([k, v]) => (
        <React.Fragment key={k}>
          <ListHeader title={k} />
          {v.map((rec) => (
            <ListItem
              key={rec.datetime.getTime()}
              recording={rec}
              recordingManager={recordingManager}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MenuBar;
