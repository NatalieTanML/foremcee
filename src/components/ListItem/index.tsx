import React, { useState } from 'react';
import { shell } from 'electron';

import { HiTrash, HiPencil, HiPlay } from 'react-icons/hi';
import { Recording, RecordingManager } from '../../recording-manager';
import IconButton from '../IconButton';

type Props = {
  recording: Recording;
  recordingManager: RecordingManager;
};

const ListItem = ({ recording, recordingManager }: Props) => {
  const [isWavLoading, setIsWavLoading] = useState<boolean>(false);
  const [isTxtLoading, setIsTxtLoading] = useState<boolean>(false);
  const [isDelLoading, setIsDelLoading] = useState<boolean>(false);

  const styleName =
    'text-indigo-500 hover:text-white hover:bg-indigo-500 active:bg-indigo-600 hover:stroke-current hover:border-transparent';
  const styleNameLoading = 'text-white bg-indigo-600';

  return (
    <div className="flex flex-row relative block bg-gray-50 rounded-md p-3 mb-2 hover:bg-indigo-50">
      <div className="flex flex-1 items-center gap-x-3">
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
        <IconButton
          onClick={async () => {
            setIsWavLoading(true);
            await recording
              .getAudio()
              .then(shell.openPath)
              .catch(console.error);
            setIsWavLoading(false);
          }}
          isLoading={isWavLoading}
          addStyleName={styleName}
          addStyleNameLoading={styleNameLoading}
        >
          <HiPlay />
        </IconButton>
        <IconButton
          onClick={async () => {
            setIsTxtLoading(true);
            await recording
              .getTranscript()
              .then(shell.openPath)
              .catch(console.error);
            setIsTxtLoading(false);
          }}
          isLoading={isTxtLoading}
          addStyleName={styleName}
          addStyleNameLoading={styleNameLoading}
        >
          <HiPencil />
        </IconButton>
        <IconButton
          onClick={async () => {
            setIsDelLoading(true);
            await recordingManager
              .deleteRecording(recording)
              .catch(console.error);
            setIsDelLoading(false);
          }}
          isLoading={isDelLoading}
          addStyleName={styleName}
          addStyleNameLoading={styleNameLoading}
        >
          <HiTrash />
        </IconButton>
      </div>
    </div>
  );
};

export default ListItem;
