const { Queue } = require("bullmq");
const connection = require("../redis");

const transcriptionQueue = new Queue("transcriptionQueue", {
  connection,
});

module.exports = transcriptionQueue;
