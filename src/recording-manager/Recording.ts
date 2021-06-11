import { promisify } from 'util';
import { access } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const accessAsync = promisify(access);

const exists = async (dir: string): Promise<boolean> => {
  try {
    await accessAsync(dir);
    return true;
  } catch (err) {
    return false;
  }
};

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
  #directory: string;

  static defaultAudioName = 'audio';

  #defaultTranscriptFilename = 'transcript.txt';

  constructor(
    public readonly title: string,
    public readonly datetime: Date,
    directory: string
  ) {
    this.#directory = directory;
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
      // TODO: Transcribe audio using deepspeech and store it.
      const audioDir = await this.getAudio();
    }

    return txtPath;
  }
}
