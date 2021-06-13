import React, { useState } from 'react';
import { shell } from 'electron';

import { HiTrash, HiPencil, HiPlay } from 'react-icons/hi';
import { Recording } from '../../recording-manager';
import ListButton from '../ListButton';

const ListItem = (prop: { rec: Recording }) => {
  const [isWavLoading, setIsWavLoading] = useState<boolean>(false);
  const [isTxtLoading, setIsTxtLoading] = useState<boolean>(false);
  const [isDelLoading, setIsDelLoading] = useState<boolean>(false);
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
          onClick={async () => {
            setIsWavLoading(true);
            shell.openPath(await recording.getAudio());
            setIsWavLoading(false);
          }}
          isLoading={isWavLoading}
          cname="mr-3"
        >
          <HiPlay />
        </ListButton>
        <ListButton
          onClick={async () => {
            setIsTxtLoading(true);
            shell.openPath(await recording.getTranscript());
            setIsTxtLoading(false);
          }}
          isLoading={isTxtLoading}
          cname="mr-3"
        >
          <HiPencil />
        </ListButton>
        <ListButton
          onClick={() => {
            setIsDelLoading(true);
            // recordingManager.deleteRecording(recording);
            setIsDelLoading(false);
          }}
          isLoading={isDelLoading}
        >
          <HiTrash />
        </ListButton>
      </div>
    </div>
  );
};

export default ListItem;
