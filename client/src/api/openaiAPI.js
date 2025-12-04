import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ===============================
// 1) GENERATE CONVERSATION (GPT-3.5)
// ===============================
export const generateConversation = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an English conversation partner. Answer naturally and provide exactly 3 short follow-up questions in an array. Return result in JSON: { answer: string, suggestions: string[] }",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    let content = response.data.choices[0].message.content;

    // Đảm bảo trả về JSON chuẩn
    try {
      const parsed = JSON.parse(content);
      return {
        answer: parsed.answer || "",
        suggestions: parsed.suggestions || [],
      };
    } catch (e) {
      // fallback nếu OpenAI trả sai JSON
      return {
        answer: content,
        suggestions: [],
      };
    }
  } catch (err) {
    console.error("generateConversation ERROR:", err.response?.data || err);
    return {
      answer: "Sorry, something went wrong.",
      suggestions: [],
    };
  }
};

// ===============================
// 2) TEXT TO SPEECH (AI GIỌNG THẬT)
// ===============================
export const textToSpeech = async (text) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "gpt-4o-mini-tts", // Hoặc "tts-1"
        voice: "alloy",
        input: text,
        format: "mp3",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        responseType: "blob", // Quan trọng!
      }
    );

    return response.data; // Blob
  } catch (err) {
    console.error("textToSpeech ERROR:", err.response?.data || err);
    return null; // Cho ChatUI fallback browser TTS
  }
};

// ===============================
// 3) SPEECH TO TEXT (WHISPER)
// ===============================
export const speechToText = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // Whisper trả về dạng JSON có .text
    return response.data.text || "";
  } catch (err) {
    console.error("speechToText ERROR:", err.response?.data || err);
    return "";
  }
};
