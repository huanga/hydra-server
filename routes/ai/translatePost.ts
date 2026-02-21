import { z } from "zod";
import { verifySubscription } from "../../middleware/subscription";
import { aiClient } from "../../utils/models";
import { ai_provider } from "../../utils/models";
import { generateText } from "ai";
import { AIUsage } from "../../services/AIUsage";

const translatePostSchema = z.object({
  customerId: z.string(),
  postTitle: z.string(),
  postText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
});

const systemPrompt = `You are a helpful assistant that translates text. Translate the given text accurately while preserving the original meaning, tone, and context. Only provide the translation without any additional explanations or formatting.`;

const makeUserPrompt = (
  sourceLanguage: string,
  targetLanguage: string,
  postTitle: string,
  postText: string,
) => {
  const sourceLangName = sourceLanguage === "auto" ? "automatically detected language" : 
    sourceLanguage === "en" ? "English" :
    sourceLanguage === "zh-Hant" ? "Chinese Traditional" :
    sourceLanguage === "zh-Hans" ? "Chinese Simplified" :
    sourceLanguage === "es" ? "Spanish" :
    sourceLanguage === "fr" ? "French" :
    sourceLanguage === "de" ? "German" :
    sourceLanguage === "pt" ? "Portuguese" :
    sourceLanguage === "ja" ? "Japanese" :
    sourceLanguage === "ko" ? "Korean" :
    sourceLanguage === "ru" ? "Russian" : sourceLanguage;

  const targetLangName = 
    targetLanguage === "en" ? "English" :
    targetLanguage === "zh-Hant" ? "Chinese Traditional" :
    targetLanguage === "zh-Hans" ? "Chinese Simplified" :
    targetLanguage === "es" ? "Spanish" :
    targetLanguage === "fr" ? "French" :
    targetLanguage === "de" ? "German" :
    targetLanguage === "pt" ? "Portuguese" :
    targetLanguage === "ja" ? "Japanese" :
    targetLanguage === "ko" ? "Korean" :
    targetLanguage === "ru" ? "Russian" : targetLanguage;

  return `
Translate the following Reddit post from ${sourceLangName} to ${targetLangName}:

Title: ${postTitle}

${postText ? `Post Content:\n${postText}` : ""}
`;
};

let MODEL_ID: string = "";

if (ai_provider == "groq") {
  MODEL_ID = "openai/gpt-oss-20b";
} else {
  MODEL_ID = process.env.OPENAI_SUMMARY_MODEL || "gpt-4.1-mini";
}

export async function translatePost(req: Request) {
  const body = await req.json();
  const { customerId, postTitle, postText, sourceLanguage, targetLanguage } =
    translatePostSchema.parse(body);
  const isSubscribed = await verifySubscription(customerId);
  if (!isSubscribed) {
    return new Response("Customer is not subscribed", { status: 403 });
  }

  const isOverLimit = AIUsage.isOverLimit(customerId);
  if (isOverLimit) {
    return new Response("Monthly usage limit exceeded", { status: 429 });
  }

  // Generate the translation using AI
  const { text, usage } = await generateText({
    model: aiClient(MODEL_ID),
    maxOutputTokens: 2_000,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: makeUserPrompt(sourceLanguage, targetLanguage, postTitle, postText),
      },
    ],
  });

  await AIUsage.trackUsage(customerId, MODEL_ID, usage);

  return new Response(text, {
    headers: { "Content-Type": "application/json" },
  });
}
