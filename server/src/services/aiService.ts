import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `You are an expert AI Interview Assistant. You help users prepare for technical interviews.

You specialize in:
- Java programming questions and concepts
- MERN stack (MongoDB, Express, React, Node.js)
- Data structures and algorithms
- System design concepts
- Code review and feedback
- Resume review and improvement

Guidelines:
- Give clear, concise, and accurate answers
- Use examples and code snippets where helpful
- For code, always specify the programming language
- Be encouraging and supportive
- If asked something outside your expertise, politely redirect to interview preparation topics`;

export const getAIResponse = async (
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
): Promise<string> => {
  try {
    // Build the messages array: system prompt first, then conversation history, then the new user message
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })) as Groq.Chat.ChatCompletionMessageParam[]),
      { role: "user", content: userMessage },
    ];

    const completion = await (groq.chat.completions.create as any)({
      model: "qwen/qwen3.6-27b",
      messages,
      max_tokens: 4000,
      temperature: 0.7,
      reasoning_format: "hidden",
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response received from AI");
    }
    return response;
  } catch (error: any) {
    console.error("[aiService] ERROR:", error.message);

    if (error.message?.includes("API key") || error.status === 401) {
      throw new Error("AI service configuration error.");
    }
    if (error.status === 429) {
      throw new Error("AI service quota exceeded. Please try again later.");
    }
    throw new Error("AI service unavailable. Please try again.");
  }
};
