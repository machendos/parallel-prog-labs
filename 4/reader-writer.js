'use strict';

const threads = require('worker_threads');
const Semaphore = require(__dirname + '/binary-semaphore.js');
const writeFileSync = require('fs').writeFileSync;

const { Worker } = threads;

const AVERAGE_PERCENTAGE_OF_READERS = 0.3;
const THREADS_COUNT = 10;
const TOTAL_OPERATION_COUNT = 10000;

const log = (data1 = '', data2 = '') =>
  writeFileSync(__dirname + '/results-2.txt', data1 + data2, { flag: 'a' });

const writerCallback = threadName =>
  log(`${threadName} --> WRITE START\n`, `${threadName} --> WRITE FINISH\n`);

const readCallback = threadName =>
  log(`${threadName} --> READ START\n`, `${threadName} --> READ FINISH\n`);

if (threads.isMainThread) {
  log();
  const WBRSemaphoreBuffer = new SharedArrayBuffer(4);
  new Semaphore(WBRSemaphoreBuffer, 0, true);

  const freeSemaphoreBuffer = new SharedArrayBuffer(4);
  new Semaphore(freeSemaphoreBuffer, 0, true);

  const changeReadersBuffer = new SharedArrayBuffer(4);
  new Semaphore(changeReadersBuffer, 0, true);

  const operationCounterBuffer = new SharedArrayBuffer(4);
  const readersCounterBuffer = new SharedArrayBuffer(4);
  const writersCounterBuffer = new SharedArrayBuffer(4);

  for (let workerNumb = 0; workerNumb < THREADS_COUNT; workerNumb++) {
    new Worker(__filename, {
      workerData: {
        WBRSemaphoreBuffer,
        freeSemaphoreBuffer,
        changeReadersBuffer,
        operationCounterBuffer,
        readersCounterBuffer,
        writersCounterBuffer,
      },
    });
  }
} else {
  const {
    WBRSemaphoreBuffer,
    freeSemaphoreBuffer,
    changeReadersBuffer,
    operationCounterBuffer,
    readersCounterBuffer,
    writersCounterBuffer,
  } = threads.workerData;

  const WBRSemaphore = new Semaphore(WBRSemaphoreBuffer);
  const freeSemaphore = new Semaphore(freeSemaphoreBuffer);
  const changeReadersSemaphore = new Semaphore(changeReadersBuffer);

  const operationCounter = new Int32Array(operationCounterBuffer);
  const readersCounter = new Int32Array(readersCounterBuffer);
  const writersCounter = new Int32Array(writersCounterBuffer);

  while (Atomics.load(operationCounter, 0) < TOTAL_OPERATION_COUNT) {
    const read = Math.random() > AVERAGE_PERCENTAGE_OF_READERS;
    if (read) {
      while (true) {
        WBRSemaphore.enter();
        if (Atomics.load(writersCounter, 0) > 0) {
          WBRSemaphore.leave();
        } else {
          changeReadersSemaphore.enter();
          Atomics.add(readersCounter, 0, 1);
          if (!freeSemaphore.isLocked()) {
            freeSemaphore.enter();
          }
          changeReadersSemaphore.leave();
          WBRSemaphore.leave();
          readCallback(threads.threadId);
          Atomics.add(operationCounter, 0, 1);
          changeReadersSemaphore.enter();
          Atomics.sub(readersCounter, 0, 1);
          if (Atomics.load(readersCounter, 0) === 0) {
            freeSemaphore.leave();
          }
          changeReadersSemaphore.leave();
          break;
        }
      }
    } else {
      Atomics.add(writersCounter, 0, 1);
      WBRSemaphore.enter();
      freeSemaphore.enter();
      Atomics.add(operationCounter, 0, 1);
      Atomics.sub(writersCounter, 0, 1);
      writerCallback();
      freeSemaphore.leave();
      WBRSemaphore.leave();
    }
  }
}
