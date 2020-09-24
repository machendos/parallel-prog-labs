'use strict';

const ReentrantLock = require(__dirname + '/reentrant-lock');
const thread = require('worker_threads');
const writeFileSync = require('fs').writeFileSync;

const { Worker } = thread;

const PHILOSOPHERS_COUNT = 500;

const log = (data1 = '', data2 = '', flag = 'a') =>
  writeFileSync(__dirname + '/results-4.txt', data1 + data2, { flag });

if (thread.isMainThread) {
  log('', '', 'w');
  const lockerBuffer = new SharedArrayBuffer(4);
  new ReentrantLock(lockerBuffer, 0, true);

  const busyForksPerPhilBuffer = new SharedArrayBuffer(PHILOSOPHERS_COUNT * 4);
  for (let threadNumb = 0; threadNumb < PHILOSOPHERS_COUNT; threadNumb++) {
    const prevPhilIndex =
      threadNumb === 0 ? PHILOSOPHERS_COUNT - 1 : threadNumb - 1;
    const nextPhilIndex =
      threadNumb + 1 === PHILOSOPHERS_COUNT ? 0 : threadNumb + 1;
    new Worker(__filename, {
      workerData: {
        busyForksPerPhilBuffer,
        prevPhilIndex,
        currPhilIndex: threadNumb,
        nextPhilIndex,
        lockerBuffer,
      },
    });
  }
} else {
  const {
    busyForksPerPhilBuffer,
    prevPhilIndex,
    currPhilIndex,
    nextPhilIndex,
    lockerBuffer,
  } = thread.workerData;
  const locker = new ReentrantLock(lockerBuffer);
  const busyForksPerPhil = new Int32Array(busyForksPerPhilBuffer);
  log('1\n');
  while (true) {
    log('2\n');

    locker.enter();

    if (Atomics.load(busyForksPerPhil, currPhilIndex) === 0) {
      Atomics.add(busyForksPerPhil, prevPhilIndex, 1);
      Atomics.add(busyForksPerPhil, nextPhilIndex, 1);
      locker.leave();

      log(`${thread.threadId} START EATING\n`);
      // setTimeout(() => {
      log(`${thread.threadId} FINISH EATING\n`);

      locker.enter();

      Atomics.sub(busyForksPerPhil, prevPhilIndex, 1);
      Atomics.sub(busyForksPerPhil, nextPhilIndex, 1);

      Atomics.notify(busyForksPerPhil, prevPhilIndex);
      Atomics.notify(busyForksPerPhil, nextPhilIndex);

      locker.leave();
      // }, 500);

      break;
    } else {
      const now = Atomics.load(busyForksPerPhil, currPhilIndex);
      if (now > 0) {
        locker.leave();
        Atomics.wait(busyForksPerPhil, currPhilIndex, now);
      } else locker.leave();
    }

    log('3\n');
  }
}
