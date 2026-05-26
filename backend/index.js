const express = require("express");
const cors = require("cors");
const multer = require("multer");

require("dotenv").config();
require("./db");

const Call = require("./models/Call");

const transcriptionQueue = require("./queues/transcriptionQueue");

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });
const path = require("path");

app.get("/", (req, res) => {
  res.send("Test");
});

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const filePath = path.resolve(req.file.path);

    const newCall = await Call.create({
      filename: req.file.originalname,
      status: "queued",
    });

    // ADD JOB TO QUEUE
const job = await transcriptionQueue.add(
  "transcribe-audio",

  {
    filePath,
    callId: newCall._id,
  },

  {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
);

    console.log("Job added:", job.id);

    res.json({
      success: true,
      message: "File uploaded and queued",
      jobId: job.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/call/:id", async (req, res) => {
  try {
    const call = await Call.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        error: "Call not found",
      });
    }

    res.json(call);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/calls", async (req, res) => {
  try {
    const calls = await Call.find().sort({ createdAt: -1 });

    res.json(calls);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
