import Conversation, { IConversation } from "../models/Conversation";
import Message, { IMessage } from "../models/Message";
import { getAIResponse } from "./aiService";

export const createConversation = async (
  userId: string,
  title: string,
): Promise<IConversation> => {
  const conversation = await Conversation.create({ userId, title });
  return conversation;
};

export const getConversations = async (
  userId: string,
): Promise<IConversation[]> => {
  const conversations = await Conversation.find({ userId }).sort({
    updatedAt: -1,
  });
  return conversations;
};

export const getMessages = async (
  conversationId: string,
  userId: string,
): Promise<IMessage[]> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });
  if (!conversation) throw new Error("Conversation not found");
  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });
  return messages;
};

export const sendMessage = async (
  conversationId: string,
  userId: string,
  content: string,
): Promise<{ userMessage: IMessage; aiMessage: IMessage }> => {
  console.log("sendMessage called with conversationId:", conversationId);
  console.log("userId:", userId);
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });
  if (!conversation) throw new Error("Conversation not found");

  const userMessage = await Message.create({
    conversationId,
    role: "user",
    content,
  });

  const history = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(10);
  const conversationHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const aiResponse = await getAIResponse(content, conversationHistory);
  const aiMessage = await Message.create({
    conversationId,
    role: "assistant",
    content: aiResponse,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });

  if (conversation.title === "New Conversation") {
    await Conversation.findByIdAndUpdate(conversationId, {
      title: content.slice(0, 50),
    });
  }

  return { userMessage, aiMessage };
};

export const deleteConversation = async (
  conversationId: string,
  userId: string,
): Promise<void> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });
  if (!conversation) throw new Error("Conversation not found");
  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);
};
