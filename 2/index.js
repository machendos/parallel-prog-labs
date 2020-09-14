'use strict';

const { CPUQueue, CPUProcess, CPU } = require(__dirname + '/2.js');

const FIRST_PROCESS_NAME = 1;
const SECOND_PROCESS_NAME = 2;

const firstProcess = new CPUProcess(FIRST_PROCESS_NAME, 100, 200, 150);
const secondProcess = new CPUProcess(SECOND_PROCESS_NAME, 100, 200, 190);

const queue = new CPUQueue();
const cpu = new CPU(90, 120, queue);

let firstProcessDestroyed = 0;
let secondProcessInterrupted = 0;
let maxQueueLength = 0;

firstProcess.on('generate', () => {
  if (cpu.currProcess === SECOND_PROCESS_NAME) {
    queue.add(SECOND_PROCESS_NAME);
    if (maxQueueLength < queue.length) maxQueueLength = queue.length;
    secondProcessInterrupted++;
  } else if (cpu.currProcess === FIRST_PROCESS_NAME) {
    firstProcessDestroyed++;
  }
  cpu.process(FIRST_PROCESS_NAME);
});

secondProcess.on('generate', () => {
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
  console.log(firstProcessDestroyed);
  console.log(secondProcessInterrupted);
  console.log(maxQueueLength);
});
