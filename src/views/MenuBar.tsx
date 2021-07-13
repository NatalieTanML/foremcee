import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CgSpinner } from 'react-icons/cg';
import { IconContext } from 'react-icons';
import {
  HiOutlineCog,
  HiSortAscending,
  HiSortDescending,
  HiUpload,
} from 'react-icons/hi';
import { createReadStream } from 'fs';
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
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  const history = useHistory();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const styleName =
    'text-indigo-500 bg-indigo-50 hover:text-white active:text-white hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none';

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

  const filterByCurrentInput = (recs: Recording[]) => {
    const inputString = input.toLowerCase().trim();
    let filtered = recs.filter(
      (recording) =>
        recording.datetime
          .toLocaleDateString('en-US', { dateStyle: 'full' })
          .toLowerCase()
          .includes(inputString) ||
        recording.title.toLowerCase().includes(inputString)
    );
    filtered = sortAscending ? filtered.reverse() : filtered;
    return groupRecordingsByDate(filtered);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;
    if (files.length > 0 && recordingManager) {
      const media = createReadStream(files[0].path);
      await recordingManager.importMediaAsRecording(media).catch(console.error);
    }
    e.target.value = '';
  };

  const uploadFile = () => {
    if (!fileRef.current) return;
    fileRef.current.click();
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
          setRecordings(filterByCurrentInput(recs));
        }
      })
      .catch(console.error);
    return () => {
      cancel = true;
    };
  });

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
        <IconButton
          onClick={() => setSortAscending(!sortAscending)}
          addStyleName={styleName}
        >
          {sortAscending ? <HiSortAscending /> : <HiSortDescending />}
        </IconButton>
        <Search
          keyword={input}
          setKeyword={setInput}
          title="Search for a recording"
          placeholder="Search"
        />
        <div>
          <input
            type="file"
            name="file"
            className="hidden"
            accept="audio/*,video/*"
            ref={fileRef}
            onChange={handleFileChange}
          />
          <IconButton
            onClick={uploadFile}
            addStyleName={styleName}
            title="Upload video/audio file for transcribing"
          >
            <HiUpload />
          </IconButton>
        </div>
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
