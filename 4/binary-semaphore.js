'use strict';

const LOCKED = 0;
const UNLOCKED = 1;

class Semaphore {
  constructor(shared, offset = 0, initial = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (initial) Atomics.store(this.lock, 0, UNLOCKED);
  }

  enter() {
    let prev = Atomics.exchange(this.lock, 0, LOCKED);
    while (prev !== UNLOCKED) {
      Atomics.wait(this.lock, 0, LOCKED);
      prev = Atomics.exchange(this.lock, 0, LOCKED);
    }
  }

  leave() {
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
    this.owner = false;
  }

  isLocked() {
    return Atomics.load(this.lock, 0) === LOCKED;
  }
}

module.exports = Semaphore;
