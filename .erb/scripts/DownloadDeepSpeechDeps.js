import path from 'path';
import https from 'https';
import { unlinkSync, accessSync, mkdirSync, rmdirSync, createWriteStream } from 'fs';
import { deepSpeech } from '../../package.json';

const download = (url, dest) => new Promise((resolve, reject) => {
  const file = createWriteStream(dest);
  https.get(url, resp => {
    if ([301, 302].indexOf(resp.statusCode) > -1) {
      return download(resp.headers.location, dest);
    }
    resp.pipe(file);
    file.on('finish', () => {
      file.close(resolve);
    });
  }).on('error', err => {
    unlinkSync(dest);
    return reject(err);
  });
});

const exists = dir => {
  try {
    accessSync(dir);
    return true;
  } catch (err) {
    return false;
  }
};

const CONSOLE_GREEN_FONT = '\x1b[32m';
const CONSOLE_RED_FONT = '\x1b[31m';

const deepSpeechDepPath = path.join(__dirname, '..', '..', 'src', 'deepspeech');
const modelDir = path.join(deepSpeechDepPath, 'model.pbmm');
const scorerDir = path.join(deepSpeechDepPath, 'scorer.scorer');

let directoryModified = false;

const handleDownloadFailure = err => {
  if (err) console.log(CONSOLE_RED_FONT, err);
  console.log(CONSOLE_RED_FONT, 'Unable to download DeepSpeech dependencies, please re-install your modules again.');

  if (directoryModified) {
    rmdirSync(deepSpeechDepPath, {
      recursive: true
    });
  }
};

process.on('SIGTERM', signal => {
  handleDownloadFailure();
  process.exit(1);
});

process.on('SIGINT', signal => {
  handleDownloadFailure();
  process.exit(1);
});

process.on('uncaughtException', err => {
  handleDownloadFailure(err);
  process.exit(1);
});

if (!exists(deepSpeechDepPath)) {
  directoryModified = true;
  mkdirSync(deepSpeechDepPath);
}

const ongoingDownloads = [];

if (!exists(modelDir)) {
  directoryModified = true;
  console.log(CONSOLE_GREEN_FONT, 'Downloading model...');
  ongoingDownloads.push(download(deepSpeech.model, modelDir));
}

if (!exists(scorerDir)) {
  directoryModified = true;
  console.log(CONSOLE_GREEN_FONT, 'Downloading scorer...');
  ongoingDownloads.push(download(deepSpeech.scorer, scorerDir));
}

if (ongoingDownloads.length > 0) {
  Promise.all(ongoingDownloads)
    .then(res => console.log(CONSOLE_GREEN_FONT, 'DeepSpeech dependencies downloaded.'))
    .catch(handleDownloadFailure);
} else {
  console.log(CONSOLE_GREEN_FONT, 'DeepSpeech dependencies are already present.');
}