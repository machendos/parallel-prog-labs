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

module.exports = CPUQueue;
