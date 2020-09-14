// 'use strict';

const threads = require('worker_threads');
const { Worker } = threads;

const THREADS_COUNT_TESTS = [4, 8, 16];
const VECTOR_LENGTH_TESTS = [10000000, 20000000];
const MIN_VALUE = -100;
const MAX_VALUE = 100;

const scalarProduct = (vectorA, vectorB) =>
  vectorA.reduce((summ, curr, index) => summ + curr * vectorB[index], 0);

const newVector = length =>
  new Array(length)
    .fill(0)
    .map(() => Math.round(Math.random() * (MAX_VALUE - MIN_VALUE) + MIN_VALUE));

if (threads.isMainThread) {
  const f = async () => {
    const tests = {
      units: [],

      [Symbol.asyncIterator]() {
        let currUnit = 0;
        return {
          next() {
            if (currUnit === tests.units.length) return { done: true };
            let { threadsCount, vectorLength } = tests.units[currUnit++];

            const vector1 = newVector(vectorLength);
            const vector2 = newVector(vectorLength);

            console.log(`${threadsCount} threads\n${vectorLength} length\n`);

            const sequentialStart = new Date().getTime();
            const sequentialResult = scalarProduct(vector1, vector2);
            const sequentialTime = new Date().getTime() - sequentialStart;

            const resultsBuffer = new SharedArrayBuffer(threadsCount * 4);
            const results = new Int32Array(resultsBuffer);

            const workers = [];

            const oneThreadPart = Math.ceil(vectorLength / threadsCount);

            for (let workerNumb = 0; workerNumb < threadsCount; workerNumb++) {
              const startIndex = oneThreadPart * workerNumb;
              const endIndex = oneThreadPart * (workerNumb + 1);
              const worker = new Worker(__filename, {
                workerData: {
                  vector1: vector1.slice(startIndex, endIndex),
                  vector2: vector2.slice(startIndex, endIndex),
                  resultsBuffer,
                  workerNumb,
                },
              });
              workers.push(worker);
            }
            const parallelStart = new Date().getTime();
            return Promise.all(
              workers.map(
                worker =>
                  new Promise(res => {
                    worker.on('exit', () => res(results));
                  })
              )
            ).then(results => {
              const parallelTime = new Date().getTime() - parallelStart;
              const parallelRes = results[0].reduce((prv, curr) => prv + curr);

              console.log(`Seq result: ${sequentialResult}`);
              console.log(`Par result: ${parallelRes}`);
              console.log(`Seq time: ${sequentialTime}ms`);
              console.log(`Par time: ${parallelTime}ms\n`);
              const boostSpeedCoef = sequentialTime / parallelTime;
              return { value: [boostSpeedCoef, boostSpeedCoef / threadsCount] };
            });
          },
        };
      },
    };

    THREADS_COUNT_TESTS.forEach(threadsCount =>
      VECTOR_LENGTH_TESTS.forEach(vectorLength =>
        tests.units.push({ threadsCount, vectorLength })
      )
    );
    for await (let [boostSpeedCoef, efficiency] of tests) {
      console.log(`S = ${boostSpeedCoef.toFixed(3)}`);
      console.log(`E = ${efficiency.toFixed(3)}`);
      console.log('================\n');
    }
  };
  f();
} else {
  const { vector1, vector2, resultsBuffer, workerNumb } = threads.workerData;
  const results = new Int32Array(resultsBuffer);

  const product = scalarProduct(vector1, vector2);
  results[workerNumb] = product;
}
