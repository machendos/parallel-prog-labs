'use strict';

// We have a certain number of producers (their number is stored in a constant
// PROCUCER_COUNT) that produce some things and put them in the store.
// Consumers then buy them at the store. The store has capacity of storage.
// If the store is full, producers no longer produce things,
// waiting for at least one product to be bought by some consumer
// There are a number of things to do in total (TOTAL_PRODUCTS_COUNT)

// Task: create model using ReentrantLock (5 variant). In JavaScript,
// analogue of ReentrantLock is Mutex

const Mutex = require(__dirname + '/mutex');
const thread = require('worker_threads');
const fs = require('fs');

const TOTAL_PRODUCTS_COUNT = 100;
const SHOP_CAPACITY = 3;
const PRODUCERS_COUNT = 4;
const CONSUMERS_COUNT = 4;

const { Worker } = thread;

if (thread.isMainThread) {
  const mutexBuffer = new SharedArrayBuffer(4);
  new Mutex(mutexBuffer, 0, true);

  const shopBuffer = new SharedArrayBuffer(16);
  const shop = new Int32Array(shopBuffer);
  setTimeout(() => console.log(shop), 1000);
  // сколько занято, сколько изготовлено, сколько употреблено
  for (let producerNumb = 0; producerNumb < PRODUCERS_COUNT; producerNumb++) {
    new Worker(__filename, {
      workerData: {
        mutexBuffer,
        shopBuffer,
        producer: true,
        name: `producer ${producerNumb}`,
      },
    });
  }
  for (let consumerNumb = 0; consumerNumb < CONSUMERS_COUNT; consumerNumb++) {
    new Worker(__filename, {
      workerData: {
        mutexBuffer,
        shopBuffer,
        producer: false,
        name: `consumer ${consumerNumb}`,
      },
    });
  }
} else {
  const { mutexBuffer, shopBuffer, producer, name } = thread.workerData;
  const mutex = new Mutex(mutexBuffer);
  const shop = new Int32Array(shopBuffer);
  if (producer) {
    while (shop[1] < TOTAL_PRODUCTS_COUNT) {
      mutex.enter();
      const currCount = shop[0];
      const produced = shop[1];
      if (currCount < SHOP_CAPACITY && produced < TOTAL_PRODUCTS_COUNT) {
        const old = Atomics.add(shop, 3, 1);
        fs.writeFileSync(
          __dirname + '/results.txt',
          `${name} produced product. Before: ${shop[0]}. After: ${
            shop[0] + 1
          } Индекс: ${old + 1}\n`,
          { flag: 'a' }
        );
        shop[0]++;
        shop[1]++;
      } else setTimeout(() => {}, 1000);
      mutex.leave();
    }
  } else {
    while (shop[2] < TOTAL_PRODUCTS_COUNT) {
      mutex.enter();
      const currCount = shop[0];
      const consumed = shop[2];

      if (currCount > 0 && consumed < TOTAL_PRODUCTS_COUNT) {
        const old = Atomics.add(shop, 3, 1);
        fs.writeFileSync(
          __dirname + '/results.txt',
          `${name} consumed product. Before: ${shop[0]}. After: ${
            shop[0] - 1
          } Индекс: ${old + 1}\n`,
          { flag: 'a' }
        );
        shop[0]--;
        shop[2]++;
      }
      mutex.leave();
    }
  }
}
