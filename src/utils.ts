import { promisify } from 'util';
import { access, createWriteStream, PathLike } from 'fs';
import * as stream from 'stream';
import axios from 'axios';

const finished = promisify(stream.finished);

const accessAsync = promisify(access);

export const exists = async (dir: string): Promise<boolean> => {
  try {
    await accessAsync(dir);
    return true;
  } catch (err) {
    return false;
  }
};

export const download = async (
  url: string,
  destDir: PathLike
): Promise<void> => {
  const writeStream = createWriteStream(destDir);
  const resp = await axios.get(url, {
    responseType: 'stream',
  });
  resp.data.pipe(writeStream);
  return finished(writeStream);
};
