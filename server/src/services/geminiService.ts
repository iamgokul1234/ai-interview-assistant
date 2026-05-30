import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

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

console.log(
  "Gemini API Key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO",
);

export const getAIResponse = async (
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const history = conversationHistory.slice(-10).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const fullMessage =
      conversationHistory.length === 0
        ? `${systemPrompt}\n\nUser: ${userMessage}`
        : userMessage;

    const result = await chat.sendMessage(fullMessage);
    const response = result.response.text();

    return response;
  } catch (error: any) {
    if (error.message?.includes("quota")) {
      throw new Error("AI service quota exceeded. Please try again later.");
    }
    if (error.message?.includes("API key")) {
      throw new Error("AI service configuration error.");
    }
    throw new Error("AI service unavailable. Please try again.");
  }
};
