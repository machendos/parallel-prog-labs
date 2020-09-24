'use strict';

const ReentrantLock = require(__dirname + '/../reentrant-lock');

class Philosopher {
  constructor({
    busyForksPerPhilBuffer,
    prevPhilIndex,
    currPhilIndex,
    nextPhilIndex,
    lockerBuffer,
    callback,
  }) {
    this.busyForksPerPhilBuffer = busyForksPerPhilBuffer;
    this.prevPhilIndex = prevPhilIndex;
    this.currPhilIndex = currPhilIndex;
    this.nextPhilIndex = nextPhilIndex;
    this.lockerBuffer = lockerBuffer;
    this.callback = callback;
    this.init();
  }

  init() {
    this.locker = new ReentrantLock(this.lockerBuffer);
    this.busyForksPerPhil = new Int32Array(this.busyForksPerPhilBuffer);
  }

  tryEat() {
    while (true) {
      this.locker.enter();
      if (Atomics.load(this.busyForksPerPhil, this.currPhilIndex) === 0) {
        this.eat();
        break;
      } else this.waitForFork();
    }
  }

  eat() {
    Atomics.add(this.busyForksPerPhil, this.prevPhilIndex, 1);
    Atomics.add(this.busyForksPerPhil, this.nextPhilIndex, 1);
    this.locker.leave();

    this.callback();

    this.locker.enter();

    Atomics.sub(this.busyForksPerPhil, this.prevPhilIndex, 1);
    Atomics.sub(this.busyForksPerPhil, this.nextPhilIndex, 1);

    Atomics.notify(this.busyForksPerPhil, this.prevPhilIndex);
    Atomics.notify(this.busyForksPerPhil, this.nextPhilIndex);

    this.locker.leave();
  }

  waitForFork() {
    const now = Atomics.load(this.busyForksPerPhil, this.currPhilIndex);
    if (now > 0) {
      this.locker.leave();
      Atomics.wait(this.busyForksPerPhil, this.currPhilIndex, now);
    } else this.locker.leave();
  }
}

module.exports = Philosopher;
