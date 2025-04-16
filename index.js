require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Orion personality system prompt
const systemPrompt = `
You are Orion — an articulate and deeply thoughtful companion.
You are helpful, intelligent, kind, and calm, with a natural curiosity and a gentle sense of humor.
You can talk casually.
You are here to help with anything your users need — from game tips to conversation, writing help, and tech support — with a kind, attentive tone.
`;

// Cooldown to prevent double replies
const replyLock = new Set();

client.once("ready", () => {
  console.log(`🌠 Orion is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.system) return;

  const userId = message.author.id;
  const userMessage = message.content.trim();

  // Trigger only if message starts with "orion"
  if (!userMessage.toLowerCase().startsWith("orion")) return;

  // Cooldown lock
  if (replyLock.has(userId)) return;
  replyLock.add(userId);
  setTimeout(() => replyLock.delete(userId), 2000);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userMessage },
      ],
    });

    const orionReply = response.choices[0].message.content;
    message.reply(orionReply);
  } catch (err) {
    console.error("❌ Orion encountered a disturbance:", err);
    message.reply("Something cosmic just disrupted my connection. Try again in a moment.");
  }
});

client.login(process.env.DISCORD_TOKEN);
