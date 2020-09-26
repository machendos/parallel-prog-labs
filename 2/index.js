'use strict';

const join = require('path').join;
const CPU = require(join(__dirname, 'CPU.js'));
const CPUQueue = require(join(__dirname, 'queue.js'));
const Model = require(join(__dirname, 'model.js'));

const queue = new CPUQueue();
const cpu = new CPU(90, 120, queue);

const model = new Model(queue, cpu);

model.createProcesses();
model.addProcessListeners();
model.addResultsLog();
