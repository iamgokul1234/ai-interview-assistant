import Conversation, { IConversation } from "../models/Conversation";
import Message, { IMessage } from "../models/Message";

export const createConversation = async (
  userId: string,
  title: string,
): Promise<IConversation> => {
  const conversation = await Conversation.create({
    userId,
    title,
  });
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

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });
  return messages;
};

export const saveMessage = async (
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
): Promise<IMessage> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const message = await Message.create({
    conversationId,
    role,
    content,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });

  return message;
};

export const deleteConversation = async (
  conversationId: string,
  userId: string,
): Promise<void> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);
};
