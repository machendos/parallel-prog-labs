'use strict';

const thread = require('worker_threads');
const join = require('path').join;
const CPU = require(join(__dirname, 'CPU.js'));
const CPUQueue = require(join(__dirname, 'queue.js'));

const { Worker } = thread;

const FIRST_PROCESS_NAME = 1;
const FIRST_PROCESS_INTERVAL_BOTTON = 100;
const FIRST_PROCESS_INTERVAL_TOP = 200;
const FIRST_PROCESS_COUNT = 30;

const SECOND_PROCESS_NAME = 2;
const SECOND_PROCESS_INTERVAL_BOTTON = 100;
const SECOND_PROCESS_INTERVAL_TOP = 200;
const SECOND_PROCESS_COUNT = 30;

const firstProcess = new Worker(join(__dirname, 'worker.js'), {
  workerData: {
    name: FIRST_PROCESS_NAME,
    genIntervalBottom: FIRST_PROCESS_INTERVAL_BOTTON,
    genIntervalTOP: FIRST_PROCESS_INTERVAL_TOP,
    count: FIRST_PROCESS_COUNT,
  },
});

const secondProcess = new Worker(join(__dirname, 'worker.js'), {
  workerData: {
    name: SECOND_PROCESS_NAME,
    genIntervalBottom: SECOND_PROCESS_INTERVAL_BOTTON,
    genIntervalTOP: SECOND_PROCESS_INTERVAL_TOP,
    count: SECOND_PROCESS_COUNT,
  },
});

const queue = new CPUQueue();
const cpu = new CPU(90, 120, queue);

let firstProcessDestroyed = 0;
let secondProcessInterrupted = 0;
let maxQueueLength = 0;

firstProcess.on('message', () => {
  console.log(`generated ${FIRST_PROCESS_NAME}`);
  if (cpu.currProcess === SECOND_PROCESS_NAME) {
    queue.add(SECOND_PROCESS_NAME);
    if (maxQueueLength < queue.length) maxQueueLength = queue.length;
    console.log(`INTERRUPTED ${SECOND_PROCESS_NAME}`);
    clearTimeout(cpu.timeout);
    secondProcessInterrupted++;
  } else if (cpu.currProcess === FIRST_PROCESS_NAME) {
    console.log(`DESTROYED ${FIRST_PROCESS_NAME}`);
    clearTimeout(cpu.timeout);
    firstProcessDestroyed++;
  }
  cpu.process(FIRST_PROCESS_NAME);
});

secondProcess.on('message', () => {
  console.log(`generated ${SECOND_PROCESS_NAME}`);
  queue.add(SECOND_PROCESS_NAME);
  if (maxQueueLength < queue.length) maxQueueLength = queue.length;
});

Promise.all(
  [firstProcess, secondProcess].map(
    process => new Promise(res => process.on('exit', res))
  )
)
  .then(() => new Promise(res => cpu.on('empty', res)))
  .then(() => {
    console.log(
      `Destroyed first process: ${firstProcessDestroyed}/${FIRST_PROCESS_COUNT}`
    );
    console.log(`Interrupted second process: ${secondProcessInterrupted}`);
    console.log(`Max length of queue: ${maxQueueLength}`);
  });
