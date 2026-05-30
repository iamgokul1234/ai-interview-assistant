import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Conversation",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema,
);
