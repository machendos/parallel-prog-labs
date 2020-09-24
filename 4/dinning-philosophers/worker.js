'use strict';

const Philosopher = require(__dirname + '/philosopher.js');
const thread = require('worker_threads');
const writeFileSync = require('fs').writeFileSync;

const log = (data1 = '', data2 = '', flag = 'a') =>
  writeFileSync(__dirname + '/result-4.txt', data1 + data2, { flag });

const callback = threadId => {
  log(`${threadId} START EATING\n`);
  log(`${threadId} FINISH EATING\n`);
};

const philosopher = new Philosopher(
  Object.assign(thread.workerData, {
    callback: callback.bind(null, thread.threadId),
  })
);

philosopher.tryEat();
