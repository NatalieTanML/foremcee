import { app } from 'electron';
import * as deepSpeech from 'deepspeech';
import { PathLike, createReadStream, mkdir } from 'fs';
import wav from 'wav';
import path from 'path';
import { promisify } from 'util';
import { STT_MODEL_URL, STT_SCORER_URL } from '../../config';
import { exists, download } from '../utils';

const mkdirAsync = promisify(mkdir);

export default class SpeechToText {
  static #rootDir = path.join(app.getPath('userData'), 'stt');

  static #modelDir = path.join(SpeechToText.#rootDir, 'model.pbmm');

  static #scorerDir = path.join(SpeechToText.#rootDir, 'scorer.scorer');

  #bufferSize = 512;

  #model: deepSpeech.Model;

  static async installDependencies(): Promise<void> {
    const dependencyDirExist = await exists(SpeechToText.#rootDir);
    if (!dependencyDirExist) {
      await mkdirAsync(SpeechToText.#rootDir);
    }

    const modelExist = await exists(SpeechToText.#modelDir);
    const scorerExist = await exists(SpeechToText.#scorerDir);

    if (!modelExist) {
      await download(STT_MODEL_URL, SpeechToText.#modelDir);
    }

    if (!scorerExist) {
      await download(STT_SCORER_URL, SpeechToText.#scorerDir);
    }
  }

  constructor() {
    this.#model = new deepSpeech.Model(SpeechToText.#modelDir);
    this.#model.enableExternalScorer(SpeechToText.#scorerDir);
  }

  async transcribe(wavDir: PathLike): Promise<string> {
    return new Promise((resolve, reject) => {
      const modelStream = this.#model.createStream();
      const fileStream = createReadStream(wavDir, {
        highWaterMark: this.#bufferSize,
      });
      const reader = new wav.Reader();

      reader.on('error', (err) => {
        return reject(err);
      });

      // eslint-disable-next-line consistent-return
      reader.on('format', (format) => {
        if (format.sampleRate !== this.#model.sampleRate()) {
          return reject(
            new Error(
              `Invalid sample rate: ${
                format.sampleRate
              } needs to be: ${this.#model.sampleRate()}`
            )
          );
        }

        reader.on('data', (data) => {
          modelStream.feedAudioContent(data);
        });

        reader.on('end', () => {
          return resolve(modelStream.finishStream());
        });
      });

      fileStream.pipe(reader);
    });
  }
}
