import { promisify } from 'util';
import { createWriteStream, mkdirSync, readdir, rmdir, mkdir } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import Recording from './Recording';
import SpeechToText from '../speech-to-text';

const readdirAsync = promisify(readdir);
const rmdirAsync = promisify(rmdir);
const mkdirAsync = promisify(mkdir);

const formatDateForStorage = (datetime: Date) =>
  datetime.toISOString().replaceAll(':', '_').replaceAll('.', 'dot');

const formatStorageNameForDate = (name: string) =>
  name.replaceAll('_', ':').replaceAll('dot', '.');

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
    return items
      .filter((item) => item.isDirectory())
      .map(
        (folder) =>
          new Recording(
            formatStorageNameForDate(folder.name),
            new Date(formatStorageNameForDate(folder.name)),
            path.join(this.#rootDir, folder.name),
            this.#speechToText
          )
      );
  }

  async createRecording(readStream: Readable): Promise<void> {
    const newFolderName = formatDateForStorage(new Date());
    const recordingDir = path.join(this.#rootDir, newFolderName);

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
    await rmdirAsync(
      path.join(this.#rootDir, formatDateForStorage(recording.datetime)),
      { recursive: true }
    );
  }
}
