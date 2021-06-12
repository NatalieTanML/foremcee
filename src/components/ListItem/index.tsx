import React from 'react';
import { shell } from 'electron';

import { HiTrash, HiPencil, HiPlay } from 'react-icons/hi';
import { Recording } from '../../recording-manager';
import ListButton from '../ListButton';

const ListItem = (prop: { rec: Recording }) => {
  const recording = prop.rec;
  return (
    <div className="flex flex-row relative block bg-gray-50 rounded-md p-3 mb-2 hover:bg-indigo-50">
      <div className="flex flex-1 items-center">
        <div className="flex-1">
          <p className=" uppercase tracking-wide font-semibold text-xs text-gray-600">
            Recorded at
          </p>
          <p className=" uppercase tracking-wide font-bold text-md text-gray-800">
            {recording.datetime.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </p>
        </div>
        <ListButton
          onClick={async () => shell.openPath(await recording.getAudio())}
          cname="mr-3"
        >
          <HiPlay />
        </ListButton>
        <ListButton
          onClick={async () => shell.openPath(await recording.getTranscript())}
          cname="mr-3"
        >
          <HiPencil />
        </ListButton>
        <ListButton onClick={() => ''}>
          <HiTrash />
        </ListButton>
      </div>
    </div>
  );
};

export default ListItem;
