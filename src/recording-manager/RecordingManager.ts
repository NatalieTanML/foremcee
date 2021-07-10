import { promisify } from 'util';
import { createWriteStream, mkdirSync, readdir, rmdir, mkdir, stat } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import Recording from './Recording';
import SpeechToText from '../speech-to-text';

const readdirAsync = promisify(readdir);
const rmdirAsync = promisify(rmdir);
const mkdirAsync = promisify(mkdir);
const statAsync = promisify(stat);

export default class RecordingManager {
  #rootDir: string;

  #speechToText: SpeechToText;

  constructor(applicationDir: string) {
    this.#rootDir = path.join(applicationDir, 'recordings');
    this.#speechToText = new SpeechToText(applicationDir);
    try {
      mkdirSync(this.#rootDir);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }

  async getRecordings(): Promise<Array<Recording>> {
    const items = await readdirAsync(this.#rootDir, { withFileTypes: true });
    const recordings = await Promise.all(
      items
        .filter((item) => item.isDirectory())
        .map(
          async (folder) =>
            new Recording(
              folder.name,
              (
                await statAsync(path.join(this.#rootDir, folder.name))
              ).birthtime,
              path.join(this.#rootDir, folder.name),
              this.#speechToText
            )
        )
    );
    return recordings.sort(
      (x, y) => y.datetime.getTime() - x.datetime.getTime()
    );
  }

  async createRecording(readStream: Readable): Promise<void> {
    const recordingDir = path.join(this.#rootDir, uuidv4());

    await mkdirAsync(recordingDir);

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(
        path.join(recordingDir, `${Recording.defaultAudioName}.webm`)
      );
      readStream.pipe(writeStream);
      readStream.on('end', () => {
        return resolve();
      });
      readStream.on('error', (err) => {
        return reject(err);
      });
    });
  }

  async deleteRecording(recording: Recording): Promise<void> {
    await rmdirAsync(path.join(this.#rootDir, recording.title), {
      recursive: true,
    });
  }
}
