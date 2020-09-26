'use strict';

// We have a certain number of producers (their number is stored in a constant
// PROCUCER_COUNT) that produce some things and put them in the store.
// Consumers then buy them at the store. The store has capacity of storage.
// If the store is full, producers no longer produce things,
// waiting for at least one product to be bought by some consumer
// There are a number of things to do in total (TOTAL_PRODUCTS_COUNT)

// Task: 5 variant, ReentrantLock

const ReentrantLock = require(__dirname + '/reentrant-lock');
const thread = require('worker_threads');
const fs = require('fs');

const { Worker } = thread;

const TOTAL_PRODUCTS_COUNT = 1000;
const SHOP_CAPACITY = 3;
const PRODUCERS_COUNT = 10;
const CONSUMERS_COUNT = 10;

const log = (n, before, after, ind, act) => {
  fs.writeFileSync(
    __dirname + '/results-1.txt',
    `${n} ${act} product. Before: ${before}. After: ${after} Индекс: ${ind}\n`,
    { flag: 'a' }
  );
};

log.init = () => fs.writeFileSync(__dirname + '/results-1.txt', '');

if (thread.isMainThread) {
  log.init();
  const lockerBuffer = new SharedArrayBuffer(4);
  new ReentrantLock(lockerBuffer, 0, true);

  const shopBuffer = new SharedArrayBuffer(16); // busy, produced, consumed, ind
  for (let producerNumb = 0; producerNumb < PRODUCERS_COUNT; producerNumb++) {
    new Worker(__filename, {
      workerData: {
        lockerBuffer,
        shopBuffer,
        producer: true,
        name: `producer${producerNumb}`,
      },
    });
  }
  for (let consumerNumb = 0; consumerNumb < CONSUMERS_COUNT; consumerNumb++) {
    new Worker(__filename, {
      workerData: {
        lockerBuffer,
        shopBuffer,
        producer: false,
        name: `consumer${consumerNumb}`,
      },
    });
  }
} else {
  const { lockerBuffer, shopBuffer, producer, name } = thread.workerData;
  const locker = new ReentrantLock(lockerBuffer);
  const shop = new Int32Array(shopBuffer);
  if (producer) {
    while (shop[1] < TOTAL_PRODUCTS_COUNT) {
      locker.enter();
      if (shop[0] < SHOP_CAPACITY && shop[1] < TOTAL_PRODUCTS_COUNT) {
        log(name, shop[0]++, shop[0], ++shop[3], 'produced');
        shop[1]++;
      }
      locker.leave();
    }
  } else {
    while (shop[2] < TOTAL_PRODUCTS_COUNT) {
      locker.enter();
      if (shop[0] > 0 && shop[2] < TOTAL_PRODUCTS_COUNT) {
        log(name, shop[0]--, shop[0], ++shop[3], 'consumed');
        shop[2]++;
      }
      locker.leave();
    }
  }
}
