import React, { useState } from 'react';
import { shell } from 'electron';

import { HiTrash, HiPencil, HiPlay } from 'react-icons/hi';
import { Recording, RecordingManager } from '../../recording-manager';
import ListButton from '../ListButton';

type Props = {
  recording: Recording;
  recordingManager: RecordingManager;
};

const ListItem = ({ recording, recordingManager }: Props) => {
  const [isWavLoading, setIsWavLoading] = useState<boolean>(false);
  const [isTxtLoading, setIsTxtLoading] = useState<boolean>(false);
  const [isDelLoading, setIsDelLoading] = useState<boolean>(false);

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
            await recording
              .getAudio()
              .then(shell.openPath)
              .catch(console.error);
            setIsWavLoading(false);
          }}
          isLoading={isWavLoading}
          addStyleName="mr-3"
        >
          <HiPlay />
        </ListButton>
        <ListButton
          onClick={async () => {
            setIsTxtLoading(true);
            await recording
              .getTranscript()
              .then(shell.openPath)
              .catch(console.error);
            setIsTxtLoading(false);
          }}
          isLoading={isTxtLoading}
          addStyleName="mr-3"
        >
          <HiPencil />
        </ListButton>
        <ListButton
          onClick={async () => {
            setIsDelLoading(true);
            await recordingManager
              .deleteRecording(recording)
              .catch(console.error);
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
