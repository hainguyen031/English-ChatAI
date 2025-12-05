const Log = require("../models/log.model");
const History = require("../models/history.model");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const controller = {};

// Create log + AI reply (conversation)
controller.create = async (req, res) => {
  const {
    history_id,
    number_sentence,
    sentences,
    item_role = "user",
  } = req.body;
  if (!history_id || !sentences) {
    throw new ApiError(400, "history_id and sentences are required");
  }
  // Lưu log của user
  const userLogId = await Log.create(
    history_id,
    number_sentence || 0,
    sentences,
    item_role
  );

  // Lấy toàn bộ log trước đó
  const logs = await Log.findByHistory(history_id);
  // Nếu đây là tin nhắn đầu tiên, dùng câu đầu tiên làm title cho history
  console.log(logs.length);
  if (logs.length === 1 && item_role === "user") {
    const firstSentence = sentences.split(/[.?!]/)[0].trim();
    await History.updateTitle(history_id, firstSentence || "New Chat");
  }

  // 1. System role - hướng dẫn AI
  const recentLogs = logs.slice(-20);
  const messages = recentLogs.map((log) => ({
    role: log.item_role === "system" ? "assistant" : "user",
    content: log.sentences,
  }));

  const prompt = `Based on the context I provide, Answer the question below and then return 3 follow-up question suggestions to continue the conversation.\nFormat your response as a JSON object with two fields: \"answer\" and \"suggestions\".\n\nExample:\n{\n  \"answer\": \"Sure, here is the explanation...\",\n  \"suggestions\": [\"Can you give me an example?\", \"How does this apply in real life?\", \"What are the benefits?\"]\n}\n\nQuestion: ${sentences}`;

  // Prompt gửi cho AI

  // Gọi OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [...messages, { role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  let content = completion.choices[0].message.content;

  let answer = "";
  let suggestions = [];

  try {
    const parsed = JSON.parse(content);
    answer = parsed.answer || "";
    suggestions = parsed.suggestions || [];
  } catch (err) {
    // fallback nếu model trả về sai JSON
    answer = content;
    suggestions = [];
  }

  await Log.create(history_id, number_sentence || 0, answer, "system");

  const dataResponse = {
    user: {
      id: userLogId,
      message: sentences,
    },
    ai: {
      reply: answer,
      suggestions: suggestions,
    },
  };

  res
    .status(201)
    .json(
      new ApiResponse(201, dataResponse, "Conversation logged successfully")
    );
};

controller.getByHistory = async (req, res) => {
  const { history_id } = req.params;
  if (!history_id) {
    throw new ApiError(400, "history_id required");
  }

  const logs = await Log.findByHistory(history_id);
  res
    .status(200)
    .json(new ApiResponse(200, logs, "Find log list successfully"));
};

controller.translate = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, "Text is required");
  }

  const prompt = `Translate the following English text to Vietnamese: "${text}"`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  const translatedText = completion.choices[0].message.content || "";

  res
    .status(200)
    .json(new ApiResponse(200, { translatedText }, "Successful translation"));
};

controller.textToSpeech = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, "Text content is required for TTS.");
  }

  const speechFile = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: text,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await speechFile.arrayBuffer());

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
  res.send(buffer); //Blob
};

controller.speechToText = async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    throw new ApiError(400, "Audio file is required for STT.");
  }

  const result = await openai.audio.transcriptions.create({
    file: audioFile.buffer, // Multer buffer
    model: "whisper-1", // match FE
    response_format: "json",
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { text: result.text || "" },
        "Successful translation"
      )
    );
};

module.exports = controller;
