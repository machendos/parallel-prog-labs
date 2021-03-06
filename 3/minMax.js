'use strict';

const worker = require('worker_threads');
const { Worker } = worker;

const WORKER_THREADS_COUNT = 4;
const ARRAY_LENGTH = 100000;
const ELEMENT_MIN = 1;
const ELEMENT_MAX = 100000;

if (worker.isMainThread) {
  const array = new Array(ARRAY_LENGTH)
    .fill(0)
    .map(
      () =>
        Math.floor(Math.random() * (ELEMENT_MAX - ELEMENT_MIN)) + ELEMENT_MIN
    );

  const oneThreadPart = Math.ceil(ARRAY_LENGTH / WORKER_THREADS_COUNT);
  const safeMaxBuffer = new SharedArrayBuffer(4);
  const unsafeMaxBuffer = new SharedArrayBuffer(4);
  const safeMinBuffer = new SharedArrayBuffer(4);
  const unsafeMinBuffer = new SharedArrayBuffer(4);
  const safeMax = new Int32Array(safeMaxBuffer);
  const unsafeMax = new Int32Array(unsafeMaxBuffer);
  const safeMin = new Int32Array(safeMinBuffer);
  const unsafeMin = new Int32Array(unsafeMinBuffer);

  safeMin[0] = ELEMENT_MAX;
  unsafeMin[0] = ELEMENT_MAX;

  const workers = [];

  for (let workerNumb = 0; workerNumb < WORKER_THREADS_COUNT; workerNumb++) {
    const worker = new Worker(__filename, {
      workerData: {
        array: array.slice(
          oneThreadPart * workerNumb,
          oneThreadPart * (workerNumb + 1)
        ),
        safeMaxBuffer,
        unsafeMaxBuffer,
        safeMinBuffer,
        unsafeMinBuffer,
      },
    });
    workers.push(worker);
  }
  Promise.all(
    workers.map(worker => new Promise(res => worker.on('exit', res)))
  ).then(() => console.log({ safeMax, unsafeMax, safeMin, unsafeMin }));
} else {
  const {
    workerData: {
      array,
      safeMaxBuffer,
      unsafeMaxBuffer,
      safeMinBuffer,
      unsafeMinBuffer,
    },
  } = worker;

  const safeMax = new Int32Array(safeMaxBuffer);
  const unsafeMax = new Int32Array(unsafeMaxBuffer);
  const safeMin = new Int32Array(safeMinBuffer);
  const unsafeMin = new Int32Array(unsafeMinBuffer);

  array.forEach(element => {
    while (true) {
      const currMax = Atomics.load(safeMax, 0);
      if (currMax < element) {
        const updated = Atomics.compareExchange(safeMax, 0, currMax, element);
        if (updated === currMax) break;
      } else break;
    }

    while (true) {
      const currMin = Atomics.load(safeMin, 0);
      if (currMin > element) {
        const updated = Atomics.compareExchange(safeMin, 0, currMin, element);
        if (updated === currMin) break;
      } else break;
    }

    const oldMax = unsafeMax[0];
    unsafeMax[0] = Math.max(oldMax, element);
    const oldMin = unsafeMin[0];
    unsafeMin[0] = Math.min(oldMin, element);
  });
}
