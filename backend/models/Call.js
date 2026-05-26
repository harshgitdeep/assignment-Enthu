const mongoose = require("mongoose");

const CallSchema = new mongoose.Schema({

  status: {
    type: String,
    default: "queued",
  },

  filename: String,

  transcript: String,

  summary: Object,

  scorecard: Object,

  emotionTimeline: Array,

  error: String,

}, {
  timestamps: true,
});

module.exports = mongoose.model("Call", CallSchema);