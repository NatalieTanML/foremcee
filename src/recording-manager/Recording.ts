import { promisify } from 'util';
import { access } from 'fs';
import path from 'path';

const accessAsync = promisify(access);

const exists = async (dir: string): Promise<boolean> => {
  try {
    await accessAsync(dir);
    return true;
  } catch (err) {
    return false;
  }
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
      const webmPath = path.join(
        this.#directory,
        `${Recording.defaultAudioName}.webm`
      );

      // TODO: Convert webm audio to wav using ffmpeg and store it.
    }

    return wavPath;
  }

  // eslint-disable-next-line class-methods-use-this
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
