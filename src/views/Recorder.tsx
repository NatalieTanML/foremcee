import React, { useEffect } from 'react';
import { ipcRenderer, IpcRenderer } from 'electron';

// eslint-disable-next-line @typescript-eslint/no-shadow
const setupRecorder = (ipcRenderer: IpcRenderer) => {
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

export default function Recorder() {
  useEffect(() => {
    setupRecorder(ipcRenderer);
  }, []);
  return <div />;
}
