import path from 'path';
import https from 'https';
import { unlinkSync, accessSync, mkdirSync, rmdirSync, createWriteStream } from 'fs';
import { deepSpeech } from '../../package.json';

const download = (url, dest, cb) => {
  const file = createWriteStream(dest);
  https.get(url, resp => {
    if ([301, 302].indexOf(resp.statusCode) > -1) {
      return download(resp.headers.location, dest, cb)
    }
    resp.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        cb(null);
      });
    });
  }).on('error', err => {
    unlinkSync(dest);
    if (cb) cb(err);
  });
};

const exists = dir => {
  try {
    accessSync(dir);
    return true;
  } catch (err) {
    return false;
  }
};

const deepSpeechDepPath = path.join(__dirname, '..', '..', 'deep-speech');
if (!exists(deepSpeechDepPath)) {
  mkdirSync(deepSpeechDepPath);
}

const modelDir = path.join(deepSpeechDepPath, 'model.pbmm');
const scorerDir = path.join(deepSpeechDepPath, 'scorer.scorer');

if (!exists(modelDir)) {
  console.log('Downloading model...');
  download(deepSpeech.model, modelDir, err => {
    if (err !== null) {
      console.log(`Error: ${err}, undoing changes...`);
      rmdirSync(deepSpeechDepPath, {
        recursive: true
      });
      return;
    }

    if (!exists(scorerDir)) {
      console.log('Downloading scorer...');
      download(deepSpeech.scorer, scorerDir, err => {
        if (err !== null) {
          console.log(`Error: ${err}, undoing changes...`);
          rmdirSync(deepSpeechDepPath, {
            recursive: true
          });
          return;
        }

        console.log('DeepSpeech dependencies downloaded.');
      });
    } else {
      console.log('DeepSpeech dependencies downloaded.');
    }
  });
}