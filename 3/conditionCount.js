'use strict';

const worker = require('worker_threads');
const { Worker } = worker;

const WORKER_THREADS_COUNT = 64;
const ARRAY_LENGTH = 1000000;
const ELEMENT_MIN = 1;
const ELEMENT_MAX = 100;

const condition = element => element < 5 && element !== 2;

if (worker.isMainThread) {
  const array = new Array(ARRAY_LENGTH)
    .fill(0)
    .map(
      () =>
        Math.floor(Math.random() * (ELEMENT_MAX - ELEMENT_MIN)) + ELEMENT_MIN
    );
  const oneThreadPart = Math.ceil(ARRAY_LENGTH / WORKER_THREADS_COUNT);
  const safeCountBuffer = new SharedArrayBuffer(4);
  const unsafeCountBuffer = new SharedArrayBuffer(4);
  const safeCount = new Int32Array(safeCountBuffer);
  const unsafeCount = new Int32Array(unsafeCountBuffer);

  const workers = [];

  for (let workerNumb = 1; workerNumb <= WORKER_THREADS_COUNT; workerNumb++) {
    const worker = new Worker(__filename, {
      workerData: {
        array: array.slice(
          oneThreadPart * workerNumb,
          oneThreadPart * (workerNumb + 1)
        ),
        safeCountBuffer,
        unsafeCountBuffer,
      },
    });
    workers.push(worker);
  }
  Promise.all(
    workers.map(worker => new Promise(res => worker.on('exit', res)))
  ).then(() => console.log({ safeCount, unsafeCount }));
} else {
  const {
    workerData: { array, safeCountBuffer, unsafeCountBuffer },
  } = worker;
  const safeCount = new Int32Array(safeCountBuffer);
  const unsafeCount = new Int32Array(unsafeCountBuffer);
  array.forEach(element => {
    if (condition(element)) {
      Atomics.add(safeCount, 0, 1);
      unsafeCount[0] += 1;
    }
  });
}
