'use strict';

const worker = require('worker_threads');
const { Worker } = worker;

const WORKER_THREADS_COUNT = 4;
const ARRAY_LENGTH = 100;
const ELEMENT_MIN = 1;
const ELEMENT_MAX = 100;

if (worker.isMainThread) {
  const array = new Array(ARRAY_LENGTH)
    .fill(0)
    .map(
      () =>
        Math.floor(Math.random() * (ELEMENT_MAX - ELEMENT_MIN)) + ELEMENT_MIN
    );

  const oneThreadPart = Math.ceil(ARRAY_LENGTH / WORKER_THREADS_COUNT);
  const safeXORBuffer = new SharedArrayBuffer(4);
  const unsafeXORBuffer = new SharedArrayBuffer(4);
  const safeXOR = new Int32Array(safeXORBuffer);
  const unsafeXOR = new Int16Array(unsafeXORBuffer);

  const workers = [];

  for (let workerNumb = 0; workerNumb < WORKER_THREADS_COUNT; workerNumb++) {
    const worker = new Worker(__filename, {
      workerData: {
        array: array.slice(
          oneThreadPart * workerNumb,
          oneThreadPart * (workerNumb + 1)
        ),
        safeXORBuffer,
        unsafeXORBuffer,
      },
    });
    workers.push(worker);
  }
  Promise.all(
    workers.map(worker => new Promise(res => worker.on('exit', res)))
  ).then(() => console.log({ safeXOR, unsafeXOR }));
} else {
  const {
    workerData: { array, safeXORBuffer, unsafeXORBuffer },
  } = worker;

  const safeXOR = new Int32Array(safeXORBuffer);
  const unsafeXOR = new Int32Array(unsafeXORBuffer);
  safeXOR[0] = array[0];
  unsafeXOR[0] = array[0];
  array.slice(1).forEach(element => {
    Atomics.xor(safeXOR, 0, element);
    const oldXOR = unsafeXOR[0];
    unsafeXOR[0] = oldXOR ^ element;
  });
}
