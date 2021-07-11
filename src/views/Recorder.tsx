import React, { useEffect } from 'react';
import { ipcRenderer, IpcRenderer } from 'electron';
import { Readable } from 'stream';
import { RecordingManager } from '../recording-manager';

const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const setupRecorder = (
  // eslint-disable-next-line @typescript-eslint/no-shadow
  ipcRenderer: IpcRenderer,
  recordingManager: RecordingManager
) => {
  const handleStream = (stream: MediaStream) => {
    const mimeType = 'audio/webm';
    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
    });

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener('stop', async () => {
      const blob = new Blob(recordedChunks, {
        type: mimeType,
      });
      const audioArr = new Uint8Array(await blob.arrayBuffer());
      const readStream = bufferToStream(Buffer.from(audioArr));
      await recordingManager.createRecording(readStream);

      ipcRenderer.send('recording:saved', audioArr);
    });

    ipcRenderer.on('recording:stop', () => {
      mediaRecorder.stop();
    });

    mediaRecorder.start();
  };

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false,
    })
    .then(handleStream)
    .catch(console.error);
};

type Props = {
  recordingManager: RecordingManager | null;
};

export default function Recorder({ recordingManager }: Props) {
  useEffect(() => {
    if (recordingManager !== null) {
      setupRecorder(ipcRenderer, recordingManager);
    }
  }, [recordingManager]);
  return <div />;
}
