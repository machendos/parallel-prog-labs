'use strict';

const EventEmitter = require('events');

class CPUQueue extends EventEmitter {
  constructor() {
    super();
    this.process = [];
    this.length = 0;
  }

  add(processName) {
    console.log(`add ${processName} to queue. Queue length: ${this.length}`);
    this.length++;
    this.process.push(processName);
    this.emit('new');
  }

  get() {
    this.length--;
    console.log(
      `get ${this.process[0]} from queue. Queue length: ${this.length}`
    );
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
      return ++this.generated === this.count ? this.emit('fin') : this.start();
    }, timeout);
  }
}

class CPU extends EventEmitter {
  constructor(processingIntervalBotton, processingIntervalTop, queue) {
    super();
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
    console.log(`start process ${this.currProcess}`);
    this.timeout = setTimeout(() => {
      console.log(`end process ${this.currProcess}`);
      this.currProcess = undefined;
      if (this.queue.length > 0) this.process(this.queue.get());
      else this.emit('empty');
    }, timeout);
  }
}

module.exports = {
  CPUQueue,
  CPUProcess,
  CPU,
};
