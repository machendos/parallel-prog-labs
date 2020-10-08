'use strict';

const { parentPort } = require('worker_threads');

class CPUProcess {
  constructor({ name, genIntervalBottom, genIntervalTop, count, parentPort }) {
    this.name = name;
    this.genIntervalBottom = genIntervalBottom;
    this.genIntervalTop = genIntervalTop;
    this.count = count;
    this.generated = 0;
    this.parentPort = parentPort;
  }

  start() {
    const timeout =
      Math.random() * (this.genIntervalTop - this.genIntervalBottom) +
      this.genIntervalBottom;
    setTimeout(() => {
      this.parentPort.postMessage({ generated: this.name });
      parentPort.emit();
      return ++this.generated === this.count ? 1 : this.start();
    }, timeout);
  }
}

module.exports = CPUProcess;
