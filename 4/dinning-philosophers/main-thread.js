'use strict';

const ReentrantLock = require(__dirname + '/../reentrant-lock');
const thread = require('worker_threads');
const writeFileSync = require('fs').writeFileSync;

const { Worker } = thread;

const PHILOSOPHERS_COUNT = 5;
const WORKER_PATH = __dirname + '/worker.js';

writeFileSync(__dirname + '/result-4.txt', '');

const lockerBuffer = new SharedArrayBuffer(4);
new ReentrantLock(lockerBuffer, 0, true);

const busyForksPerPhilBuffer = new SharedArrayBuffer(PHILOSOPHERS_COUNT * 4);

for (let threadNumb = 0; threadNumb < PHILOSOPHERS_COUNT; threadNumb++) {
  const prevPhilIndex =
    threadNumb === 0 ? PHILOSOPHERS_COUNT - 1 : threadNumb - 1;
  const nextPhilIndex =
    threadNumb + 1 === PHILOSOPHERS_COUNT ? 0 : threadNumb + 1;
  new Worker(WORKER_PATH, {
    workerData: {
      busyForksPerPhilBuffer,
      prevPhilIndex,
      currPhilIndex: threadNumb,
      nextPhilIndex,
      lockerBuffer,
    },
  });
}
