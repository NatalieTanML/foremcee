import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

// eslint-disable-next-line import/prefer-default-export
export const fileToWav = async (
  srcFileDir: string,
  destDir: string,
  wavFileName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      // eslint-disable-next-line prettier/prettier
        '-i', srcFileDir,
      // eslint-disable-next-line prettier/prettier
        '-ar', '16000',
      // eslint-disable-next-line prettier/prettier
        '-y', path.join(destDir, `${wavFileName}.wav`),
    ]);
    let output = '';
    ffmpeg.stderr.on('data', (chunk) => {
      output += chunk;
    });
    ffmpeg.on('exit', (code) => {
      if (code) {
        return reject(new Error(output));
      }
      return resolve();
    });
  });
};
