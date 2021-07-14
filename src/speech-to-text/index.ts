import * as deepSpeech from 'deepspeech';
import { PathLike, createReadStream } from 'fs';
import wav from 'wav';
import path from 'path';

export default class SpeechToText {
  static #getRootDir = (applicationDir: string) =>
    path.join(applicationDir, 'deepspeech');

  static #getModelDir = (applicationDir: string) =>
    path.join(SpeechToText.#getRootDir(applicationDir), 'model.pbmm');

  static #getScorerDir = (applicationDir: string) =>
    path.join(SpeechToText.#getRootDir(applicationDir), 'scorer.scorer');

  #bufferSize = 512;

  #model: deepSpeech.Model;

  constructor(applicationDir: string) {
    this.#model = new deepSpeech.Model(
      SpeechToText.#getModelDir(applicationDir)
    );
    this.#model.enableExternalScorer(
      SpeechToText.#getScorerDir(applicationDir)
    );
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
