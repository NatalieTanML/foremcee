import React, { useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { ipcRenderer, IpcRenderer } from 'electron';

const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

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
      const writeStream = fs.createWriteStream(
        path.join(__dirname, '..', 'audio', 'test.webm')
      );

      const blob = new Blob(recordedChunks, {
        type: mimeType,
      });
      const audioArr = new Uint8Array(await blob.arrayBuffer());
      const audioBuffer = Buffer.from(audioArr);
      const readStream = bufferToStream(audioBuffer);

      readStream.pipe(writeStream);
      readStream.on('end', () => {
        ipcRenderer.send('recording:saved', true);
      });
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
