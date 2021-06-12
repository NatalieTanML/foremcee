import path from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { exists } from '../utils';
import SpeechToText from '../speech-to-text';

const writeFileAsync = promisify(writeFile);

const webmToWav = async (
  webmFileDir: string,
  destDir: string,
  wavFileName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      // eslint-disable-next-line prettier/prettier
      '-i', webmFileDir,
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

export default class Recording {
  static defaultAudioName = 'audio';

  #directory: string;

  #defaultTranscriptFilename = 'transcript.txt';

  #speechToText: SpeechToText;

  constructor(
    public readonly title: string,
    public readonly datetime: Date,
    directory: string,
    speechToText: SpeechToText
  ) {
    this.#directory = directory;
    this.#speechToText = speechToText;
  }

  async getAudio(): Promise<string> {
    const wavPath = path.join(
      this.#directory,
      `${Recording.defaultAudioName}.wav`
    );
    const wavExist = await exists(wavPath);

    if (!wavExist) {
      const webmFilePath = path.join(
        this.#directory,
        `${Recording.defaultAudioName}.webm`
      );

      await webmToWav(
        webmFilePath,
        this.#directory,
        Recording.defaultAudioName
      );
    }

    return wavPath;
  }

  async getTranscript(): Promise<string> {
    const txtPath = path.join(this.#directory, this.#defaultTranscriptFilename);
    const txtExist = await exists(txtPath);

    if (!txtExist) {
      const audioDir = await this.getAudio();
      const transcript = await this.#speechToText.transcribe(audioDir);
      await writeFileAsync(txtPath, transcript);
    }

    return txtPath;
  }
}
