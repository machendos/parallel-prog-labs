'use strict';

const EventEmitter = require('events');

class CPUQueue extends EventEmitter {
  constructor() {
    super();
    this.process = [];
    this.length = 0;
  }

  add(processName) {
    this.length++;
    this.process.push(processName);
    this.emit('new');
  }

  get() {
    this.length--;
    return this.process.shift();
  }
}

class CPUProcess extends EventEmitter {
  constructor(name, generateIntervalBottom, generateIntervalTop, count) {
    super();
    this.name = name;
    this.generateIntervalBottom = generateIntervalBottom;
    this.generateIntervalTop = generateIntervalTop;
    this.count = count;
    this.generated = 0;
  }

  start() {
    const timeout =
      Math.random() * (this.generateIntervalTop - this.generateIntervalBottom) +
      this.generateIntervalBottom;
    setTimeout(() => {
      this.emit('generate');
      console.log('=');
      console.log(this.generated);
      console.log(this.count);
      return ++this.generated === this.count ? this.emit('fin') : this.start();
    }, timeout);
  }
}

class CPU {
  constructor(processingIntervalBotton, processingIntervalTop, queue) {
    this.currProcess = undefined;
    this.processingIntervalBotton = processingIntervalBotton;
    this.processingIntervalTop = processingIntervalTop;
    this.queue = queue;
    queue.on('new', () => {
      if (!this.currProcess) {
        this.process(this.queue.get());
      }
    });
  }
  process(processName) {
    const timeout =
      Math.random() *
        (this.processingIntervalTop - this.processingIntervalBotton) +
      this.processingIntervalBotton;
    this.currProcess = processName;
    setTimeout(() => {
      this.currProcess = undefined;
      if (this.queue.length > 0) this.process(this.queue.get());
    }, timeout);
  }
}

module.exports = {
  CPUQueue,
  CPUProcess,
  CPU,
};
