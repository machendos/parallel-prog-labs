'use strict';

const EventEmitter = require('events');

class CPUQueue {
  constructor() {
    this.process = [];
  }

  add(processName) {
    this.process.push(processName);
  }

  get() {
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

class CPU {
  constructor() {}
}

module.exports = {
  CPUQueue,
  CPUProcess,
  CPU,
};
