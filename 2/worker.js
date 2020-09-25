'use strict';

const join = require('path').join;
const thread = require('worker_threads');

const CPUProcess = require(join(__dirname, 'process.js'));

const process = new CPUProcess(Object.assign(thread.workerData, thread));
process.start();
