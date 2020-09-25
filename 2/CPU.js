'use strict';

const EventEmitter = require('events');

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

module.exports = CPU;
