import Bookmark, {
  IBookmark,
  BookmarkCategory,
  BookmarkSource,
} from '../models/Bookmark';

export interface CreateBookmarkDTO {
  question: string;
  answer: string;
  category?: BookmarkCategory;
  starRating?: number;
  customNotes?: string;
  source?: BookmarkSource;
}

export interface UpdateBookmarkDTO {
  customNotes?: string;
  starRating?: number;
  category?: BookmarkCategory;
}

export const createBookmark = async (
  userId: string,
  data: CreateBookmarkDTO
): Promise<IBookmark> => {
  const bookmark = await Bookmark.create({
    userId,
    question: data.question,
    answer: data.answer,
    category: data.category || 'General',
    starRating: data.starRating || 3,
    customNotes: data.customNotes || '',
    source: data.source || 'chat',
  });

  return bookmark;
};

export const getBookmarks = async (
  userId: string,
  category?: string,
  search?: string,
  minRating?: number
): Promise<IBookmark[]> => {
  const query: Record<string, unknown> = { userId };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (minRating && minRating > 0) {
    query.starRating = { $gte: minRating };
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { question: regex },
      { answer: regex },
      { customNotes: regex },
    ];
  }

  return await Bookmark.find(query).sort({ createdAt: -1 });
};

export const updateBookmark = async (
  bookmarkId: string,
  userId: string,
  data: UpdateBookmarkDTO
): Promise<IBookmark> => {
  const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId });
  if (!bookmark) {
    throw new Error('Bookmark not found');
  }

  if (data.customNotes !== undefined) {
    bookmark.customNotes = data.customNotes;
  }
  if (data.starRating !== undefined) {
    bookmark.starRating = data.starRating;
  }
  if (data.category !== undefined) {
    bookmark.category = data.category;
  }

  await bookmark.save();
  return bookmark;
};

export const deleteBookmark = async (
  bookmarkId: string,
  userId: string
): Promise<void> => {
  const result = await Bookmark.deleteOne({ _id: bookmarkId, userId });
  if (result.deletedCount === 0) {
    throw new Error('Bookmark not found or already deleted');
  }
};
