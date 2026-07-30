import FlashcardDeck, {
  IFlashcardDeck,
  IFlashcard,
} from '../models/FlashcardDeck';
import type { InterviewDifficulty } from '../models/Interview';
import { getAIResponse } from './aiService';

const buildFlashcardPrompt = (topic: string): string => {
  return `You are a Senior Principal Engineer and Technical Interviewer. Create a deck of EXACTLY 10 high-impact technical flashcards for the topic "${topic}".

Cards should cover key concepts, common interview questions, tricky edge cases, and best practices.

Respond ONLY with a valid JSON object in this EXACT structure with no extra text or markdown formatting:
{
  "title": "<Deck Title e.g. ${topic} Interview Core Concepts>",
  "cards": [
    {
      "front": "<Question or Concept Prompt 1>",
      "back": "<Clear, concise, comprehensive answer 1>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 2>",
      "back": "<Clear, concise, comprehensive answer 2>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 3>",
      "back": "<Clear, concise, comprehensive answer 3>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 4>",
      "back": "<Clear, concise, comprehensive answer 4>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 5>",
      "back": "<Clear, concise, comprehensive answer 5>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 6>",
      "back": "<Clear, concise, comprehensive answer 6>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 7>",
      "back": "<Clear, concise, comprehensive answer 7>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 8>",
      "back": "<Clear, concise, comprehensive answer 8>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 9>",
      "back": "<Clear, concise, comprehensive answer 9>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    },
    {
      "front": "<Question or Concept Prompt 10>",
      "back": "<Clear, concise, comprehensive answer 10>",
      "difficulty": "<Easy, Medium, or Hard>",
      "category": "<Sub-topic category>"
    }
  ]
}`;
};

export const generateDeck = async (
  userId: string,
  topic: string
): Promise<IFlashcardDeck> => {
  const prompt = buildFlashcardPrompt(topic);
  const aiResponse = await getAIResponse(prompt, []);

  let parsed: {
    title: string;
    cards: Array<{
      front: string;
      back: string;
      difficulty: InterviewDifficulty;
      category: string;
    }>;
  };

  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI flashcard deck. Please try again.');
  }

  const formattedCards: IFlashcard[] = (parsed.cards || []).map((card, idx) => ({
    cardId: `card_${Date.now()}_${idx}`,
    front: card.front,
    back: card.back,
    difficulty: card.difficulty || 'Medium',
    category: card.category || topic,
    mastered: false,
  }));

  const deck = await FlashcardDeck.create({
    userId,
    topic,
    title: parsed.title || `${topic} Flashcards`,
    cards: formattedCards,
    masteredCount: 0,
  });

  return deck;
};

export const toggleCardMastery = async (
  deckId: string,
  userId: string,
  cardId: string,
  mastered: boolean
): Promise<IFlashcardDeck> => {
  const deck = await FlashcardDeck.findOne({ _id: deckId, userId });
  if (!deck) {
    throw new Error('Flashcard deck not found');
  }

  const targetCard = deck.cards.find((c) => c.cardId === cardId);
  if (!targetCard) {
    throw new Error('Card not found in deck');
  }

  targetCard.mastered = mastered;
  deck.masteredCount = deck.cards.filter((c) => c.mastered).length;

  await deck.save();
  return deck;
};

export const getDecks = async (userId: string): Promise<IFlashcardDeck[]> => {
  return await FlashcardDeck.find({ userId }).sort({ createdAt: -1 });
};

export const getDeckById = async (
  deckId: string,
  userId: string
): Promise<IFlashcardDeck> => {
  const deck = await FlashcardDeck.findOne({ _id: deckId, userId });
  if (!deck) {
    throw new Error('Flashcard deck not found');
  }
  return deck;
};
