const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const analyzeCall = require("../services/geminiService");

require("dotenv").config({
  path: "../.env",
});
require("../db");


const fs = require("fs");
const axios = require("axios");
const Call = require("../models/Call");


const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "transcriptionQueue",

  async (job) => {
    const { filePath, callId } = job.data;

    await Call.findByIdAndUpdate(callId, {
      status: "processing",
    });

    try {
      // STEP 1: Upload to AssemblyAI
      const uploadResponse = await axios({
        method: "post",
        url: "https://api.assemblyai.com/v2/upload",
        headers: {
          authorization: process.env.ASSEMBLY_API_KEY,
          "transfer-encoding": "chunked",
        },
        data: fs.createReadStream(filePath),
      });

      const audioUrl = uploadResponse.data.upload_url;

      console.log("Upload success");

      // STEP 2: Start transcription
      const transcriptResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",

        {
          audio_url: audioUrl,
          speaker_labels: true,
          speech_models: ["universal-3-pro"],
        },

        {
          headers: {
            authorization: process.env.ASSEMBLY_API_KEY,
            "content-type": "application/json",
          },
        },
      );

      const transcriptId = transcriptResponse.data.id;

      console.log("Transcript started:", transcriptId);

      // STEP 3: Polling
      let finalResult;

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const pollingResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,

          {
            headers: {
              authorization: process.env.ASSEMBLY_API_KEY,
            },
          },
        );

        const data = pollingResponse.data;

        console.log("Polling:", data.status);

        if (data.status === "completed") {
          finalResult = data;

          break;
        } else if (data.status === "error") {
          throw new Error(data.error);
        }
      }

      console.log("TRANSCRIPT COMPLETE");

      await Call.findByIdAndUpdate(callId, {
        status: "analyzing",
      });

      const analysis = await analyzeCall(finalResult.text);

      console.log("ANALYSIS:");

      console.log(analysis);

      console.log("AI Analysis Complete");
    
      await Call.findByIdAndUpdate(callId, {
        status: "completed",

        transcript: finalResult.text,

        summary: analysis.summary,

        scorecard: analysis.scorecard,

        emotionTimeline: analysis.emotionTimeline,
      });
      console.log("Transcript saved");
    } catch (error) {

      await Call.findByIdAndUpdate(callId, {
        status: "failed",

        error: error.message,
      });

      console.error("Worker failed:", error.message);
      throw error;
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("File cleaned up");
      }
    }
  },

  {
    connection,
    concurrency: 3,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed`);

  console.log(err.message);
});
