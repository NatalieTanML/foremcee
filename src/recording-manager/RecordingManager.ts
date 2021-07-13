import { promisify } from 'util';
import {
  createWriteStream,
  mkdirSync,
  readdir,
  rmdir,
  mkdir,
  stat,
  appendFile,
  readFile,
  writeFile,
  unlink,
} from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import Recording from './Recording';
import Metadata from './Metadata';
import SpeechToText from '../speech-to-text';
import { fileToWav } from './converter';

const readdirAsync = promisify(readdir);
const rmdirAsync = promisify(rmdir);
const mkdirAsync = promisify(mkdir);
const statAsync = promisify(stat);
const writeFileAsync = promisify(writeFile);
const appendFileAsync = promisify(appendFile);
const readFileAsync = promisify(readFile);
const unlinkAsync = promisify(unlink);

const writeStreamToDir = async (
  dir: string,
  readStream: Readable
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(dir);
    readStream.pipe(writeStream);
    readStream.on('end', () => {
      return resolve();
    });
    readStream.on('error', (err) => {
      return reject(err);
    });
  });
};

export default class RecordingManager {
  #rootDir: string;

  #speechToText: SpeechToText;

  #metadataFileName = '.metadata';

  #defaultRecordingName = 'Untitled Recording';

  #defaultImportName = 'Untitled Import';

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
        .map(async (folder) => {
          const recordingDir = path.join(this.#rootDir, folder.name);
          const { birthtime } = await statAsync(recordingDir);
          const metadataFile = await readFileAsync(
            path.join(recordingDir, this.#metadataFileName),
            'utf8'
          );
          const metadata = JSON.parse(metadataFile) as Metadata;

          return new Recording(
            folder.name,
            metadata.title,
            birthtime,
            recordingDir,
            this.#speechToText
          );
        })
    );
    return recordings.sort(
      (x, y) => y.datetime.getTime() - x.datetime.getTime()
    );
  }

  async createRecording(readStream: Readable): Promise<void> {
    const recordingDir = path.join(this.#rootDir, uuidv4());

    await mkdirAsync(recordingDir);
    await appendFileAsync(
      path.join(recordingDir, this.#metadataFileName),
      JSON.stringify(new Metadata(this.#defaultRecordingName))
    );

    return writeStreamToDir(
      path.join(recordingDir, `${Recording.defaultAudioName}.webm`),
      readStream
    );
  }

  async importMediaAsRecording(readStream: Readable): Promise<void> {
    const recordingDir = path.join(this.#rootDir, uuidv4());
    const metadataDir = path.join(recordingDir, this.#metadataFileName);
    const importedMediaDir = path.join(recordingDir, this.#defaultImportName);

    try {
      await mkdirAsync(recordingDir);
      await appendFileAsync(
        metadataDir,
        JSON.stringify(new Metadata(this.#defaultImportName))
      );
      await writeStreamToDir(importedMediaDir, readStream);
      await fileToWav(
        importedMediaDir,
        recordingDir,
        Recording.defaultAudioName
      );
      await unlinkAsync(importedMediaDir);
    } catch (err) {
      await rmdirAsync(recordingDir, {
        recursive: true,
      });
      throw err;
    }
  }

  async deleteRecording(recording: Recording): Promise<void> {
    await rmdirAsync(path.join(this.#rootDir, recording.id), {
      recursive: true,
    });
  }

  async renameRecording(
    newTitle: string,
    recording: Recording
  ): Promise<Recording> {
    const recordingDir = path.join(this.#rootDir, recording.id);
    // Uncomment to reuse existing metadata information when more than one field becomes available.
    // const metadataFile = await readFileAsync(path.join(recordingDir, this.#metadataFileName), 'utf8');
    // const metadata = JSON.parse(metadataFile) as Metadata;
    await writeFileAsync(
      path.join(recordingDir, this.#metadataFileName),
      JSON.stringify(new Metadata(newTitle))
    );
    return new Recording(
      recording.id,
      newTitle,
      recording.datetime,
      recordingDir,
      this.#speechToText
    );
  }
}
