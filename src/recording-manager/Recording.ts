import path from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { exists } from '../utils';
import SpeechToText from '../speech-to-text';
import { fileToWav as webmToWav } from './converter';

const writeFileAsync = promisify(writeFile);

export default class Recording {
  static defaultAudioName = 'audio';

  #directory: string;

  #defaultTranscriptFilename = 'transcript.txt';

  #speechToText: SpeechToText;

  constructor(
    public readonly id: string,
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
