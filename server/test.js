require('dotenv').config();
OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function checkModels() {
  const models = await client.models.list();
  console.log(models.data.map(m => m.id));
}

checkModels();