'use strict';

const { Worker } = require('worker_threads');
const join = require('path').join;

const FIRST_PROCESS_NAME = 1;
const FIRST_PROCESS_INTERVAL_BOTTON = 100;
const FIRST_PROCESS_INTERVAL_TOP = 200;
const FIRST_PROCESS_COUNT = 30;

const SECOND_PROCESS_NAME = 2;
const SECOND_PROCESS_INTERVAL_BOTTON = 100;
const SECOND_PROCESS_INTERVAL_TOP = 200;
const SECOND_PROCESS_COUNT = 30;

class Model {
  constructor(queue, cpu) {
    this.queue = queue;
    this.cpu = cpu;
    this.firstProcessDestroyed = 0;
    this.secondProcessInterrupted = 0;
    this.maxQueueLength = 0;
    this.firstProcess = null;
    this.secondProcess = null;
  }
  createProcesses() {
    this.firstProcess = new Worker(join(__dirname, 'worker.js'), {
      workerData: {
        name: FIRST_PROCESS_NAME,
        genIntervalBottom: FIRST_PROCESS_INTERVAL_BOTTON,
        genIntervalTop: FIRST_PROCESS_INTERVAL_TOP,
        count: FIRST_PROCESS_COUNT,
      },
    });

    this.secondProcess = new Worker(join(__dirname, 'worker.js'), {
      workerData: {
        name: SECOND_PROCESS_NAME,
        genIntervalBottom: SECOND_PROCESS_INTERVAL_BOTTON,
        genIntervalTop: SECOND_PROCESS_INTERVAL_TOP,
        count: SECOND_PROCESS_COUNT,
      },
    });
  }

  addProcessListeners() {
    this.firstProcess.on('message', () => {
      console.log(`generated ${FIRST_PROCESS_NAME}`);
      if (this.cpu.currProcess === SECOND_PROCESS_NAME) {
        this.queue.add(SECOND_PROCESS_NAME);
        if (this.maxQueueLength < this.queue.length)
          this.maxQueueLength = this.queue.length;
        console.log(`INTERRUPTED ${SECOND_PROCESS_NAME}`);
        clearTimeout(this.cpu.timeout);
        this.secondProcessInterrupted++;
      } else if (this.cpu.currProcess === FIRST_PROCESS_NAME) {
        console.log(`DESTROYED ${FIRST_PROCESS_NAME}`);
        clearTimeout(this.cpu.timeout);
        this.firstProcessDestroyed++;
      }
      this.cpu.process(FIRST_PROCESS_NAME);
    });

    this.secondProcess.on('message', () => {
      console.log(`gener3000ated ${SECOND_PROCESS_NAME}`);
      this.queue.add(SECOND_PROCESS_NAME);
      if (this.maxQueueLength < this.queue.length)
        this.maxQueueLength = this.queue.length;
    });
  }

  addResultsLog() {
    Promise.all(
      [this.firstProcess, this.secondProcess].map(
        process => new Promise(res => process.on('exit', res))
      )
    )
      .then(() => new Promise(res => this.cpu.on('empty', res)))
      .then(() => {
        console.log(
          `Destroyed first process: ${this.firstProcessDestroyed}/${FIRST_PROCESS_COUNT}`
        );
        console.log(
          `Interrupted second process: ${this.secondProcessInterrupted}`
        );
        console.log(`Max length of queue: ${this.maxQueueLength}`);
      });
  }
}

module.exports = Model;
