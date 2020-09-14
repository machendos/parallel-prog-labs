'use strict';

const { CPUQueue, CPUProcess, CPU } = require(__dirname + '/2.js');

const FIRST_PROCESS_NAME = 1;
const SECOND_PROCESS_NAME = 2;

const firstProcess = new CPUProcess(FIRST_PROCESS_NAME, 1000, 2000, 150);
const secondProcess = new CPUProcess(SECOND_PROCESS_NAME, 1000, 2000, 190);

const queue = new CPUQueue();
const cpu = new CPU(900, 1200, queue);

let firstProcessDestroyed = 0;
let secondProcessInterrupted = 0;
let maxQueueLength = 0;

firstProcess.on('generate', () => {
  console.log(`generated ${FIRST_PROCESS_NAME}`);
  if (cpu.currProcess === SECOND_PROCESS_NAME) {
    queue.add(SECOND_PROCESS_NAME);
    if (maxQueueLength < queue.length) maxQueueLength = queue.length;
    console.log(`INTERRUPTED ${SECOND_PROCESS_NAME}`);
    secondProcessInterrupted++;
  } else if (cpu.currProcess === FIRST_PROCESS_NAME) {
    console.log(`DESTROYED ${FIRST_PROCESS_NAME}`);
    firstProcessDestroyed++;
  }
  cpu.process(FIRST_PROCESS_NAME);
});

secondProcess.on('generate', () => {
  console.log(`generated ${SECOND_PROCESS_NAME}`);
  queue.add(SECOND_PROCESS_NAME);
  if (maxQueueLength < queue.length) maxQueueLength = queue.length;
});

firstProcess.start();
secondProcess.start();

Promise.all(
  [firstProcess, secondProcess].map(
    process => new Promise(res => process.on('fin', res))
  )
).then(() => {
  console.log(`Destroyed first process: ${firstProcessDestroyed}`);
  console.log(`Interrupted second process: ${secondProcessInterrupted}`);
  console.log(`Max length of queue: ${maxQueueLength}`);
});
