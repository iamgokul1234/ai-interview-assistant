import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setBookmarks,
  addBookmark,
  updateBookmarkInState,
  removeBookmark,
  setActiveCategory,
  setSearchQuery,
  setMinRating,
  setLoading,
  setError,
} from '../redux/slices/bookmarkSlice';
import {
  createBookmarkAPI,
  getBookmarksAPI,
  updateBookmarkAPI,
  deleteBookmarkAPI,
} from '../services/bookmarkService';
import { logout } from '../redux/slices/authSlice';
import type { BookmarkCategory } from '../types';

const CATEGORIES: Array<'All' | BookmarkCategory> = [
  'All',
  'React',
  'Node.js',
  'System Design',
  'Behavioral',
  'SQL',
  'DSA',
  'General',
];

function BookmarksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const {
    bookmarks,
    activeCategory,
    searchQuery,
    minRating,
    loading,
    error,
  } = useSelector((state: RootState) => state.bookmark);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newCategory, setNewCategory] = useState<BookmarkCategory>('General');
  const [newStarRating, setNewStarRating] = useState<number>(3);
  const [newCustomNotes, setNewCustomNotes] = useState<string>('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [token, activeCategory, minRating]);

  const fetchBookmarks = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getBookmarksAPI(token as string, {
        category: activeCategory,
        search: searchQuery,
        minRating: minRating > 0 ? minRating : undefined,
      });
      dispatch(setBookmarks(data));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load bookmarks';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookmarks();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      dispatch(setError('Question and answer are required'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const bookmark = await createBookmarkAPI(token as string, {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        category: newCategory,
        starRating: newStarRating,
        customNotes: newCustomNotes.trim(),
        source: 'custom',
      });
      dispatch(addBookmark(bookmark));
      setShowAddModal(false);
      setNewQuestion('');
      setNewAnswer('');
      setNewCustomNotes('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create bookmark';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRatingChange = async (bookmarkId: string, rating: number) => {
    try {
      const updated = await updateBookmarkAPI(token as string, bookmarkId, {
        starRating: rating,
      });
      dispatch(updateBookmarkInState(updated));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update rating';
      dispatch(setError(msg));
    }
  };

  const handleSaveNotes = async (bookmarkId: string) => {
    try {
      const updated = await updateBookmarkAPI(token as string, bookmarkId, {
        customNotes: tempNotes,
      });
      dispatch(updateBookmarkInState(updated));
      setEditingNotesId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save notes';
      dispatch(setError(msg));
    }
  };

  const handleDelete = async (bookmarkId: string) => {
    if (!window.confirm('Are you sure you want to delete this bookmark?')) return;

    try {
      await deleteBookmarkAPI(token as string, bookmarkId);
      dispatch(removeBookmark(bookmarkId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete bookmark';
      dispatch(setError(msg));
    }
  };

  return (
    <div className="chat-container">
      {/* ── Sidebar ── */}
      <div className="sidebar">
        <p className="sidebar-title">AI Interview Assistant</p>

        <button className="btn-new-chat" onClick={() => navigate('/chat')}>
          💬 New Chat
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/interview')}
          style={{
            background: 'rgba(139,92,246,0.15)',
            borderColor: 'rgba(139,92,246,0.3)',
            color: '#a78bfa',
          }}
        >
          🎯 Mock Interview
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(59,130,246,0.15)',
            borderColor: 'rgba(59,130,246,0.3)',
            color: '#60a5fa',
          }}
        >
          📊 Dashboard
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/analytics')}
          style={{
            background: 'rgba(16,185,129,0.15)',
            borderColor: 'rgba(16,185,129,0.3)',
            color: '#34d399',
          }}
        >
          📈 Analytics
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/interview')}
          style={{
            background: 'rgba(245,158,11,0.15)',
            borderColor: 'rgba(245,158,11,0.3)',
            color: '#fbbf24',
          }}
        >
          🏢 Company Interview
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/resume')}
          style={{
            background: 'rgba(236,72,153,0.15)',
            borderColor: 'rgba(236,72,153,0.3)',
            color: '#f472b6',
          }}
        >
          📄 Resume Review
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/career')}
          style={{
            background: 'rgba(99,102,241,0.15)',
            borderColor: 'rgba(99,102,241,0.3)',
            color: '#818cf8',
          }}
        >
          🧭 Career Coach
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/coding')}
          style={{
            background: 'rgba(20,184,166,0.15)',
            borderColor: 'rgba(20,184,166,0.3)',
            color: '#2dd4bf',
          }}
        >
          💻 Coding Challenge
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/daily')}
          style={{
            background: 'rgba(249,115,22,0.15)',
            borderColor: 'rgba(249,115,22,0.3)',
            color: '#fb923c',
          }}
        >
          🔥 Daily Challenge
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/flashcards')}
          style={{
            background: 'rgba(168,85,247,0.15)',
            borderColor: 'rgba(168,85,247,0.3)',
            color: '#c084fc',
          }}
        >
          🃏 Flash Cards
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/bookmarks')}
          style={{
            background: 'rgba(234,179,8,0.2)',
            borderColor: 'rgba(234,179,8,0.4)',
            color: '#fde047',
          }}
        >
          🔖 Bookmarks
        </button>

        <div style={{ flex: 1 }} />

        <div className="sidebar-footer">
          <span className="user-name">{user?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="dashboard-main">
        {/* Header */}
        <div
          className="dashboard-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1 className="dashboard-title">🔖 Bookmarked Q&As</h1>
            <p className="dashboard-subtitle">
              Your saved interview questions, AI model answers, star ratings, and personal study notes
            </p>
          </div>

          <button
            className="btn-gradient"
            onClick={() => setShowAddModal(true)}
            style={{
              width: 'auto',
              minWidth: '180px',
              background: 'linear-gradient(135deg, #eab308, #f97316)',
            }}
          >
            + Add Bookmark 🔖
          </button>
        </div>

        {/* Error Alert */}
        {error && <div className="glass-alert">⚠️ {error}</div>}

        {/* ── Search & Filter Controls ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              className="glass-input"
              type="text"
              placeholder="Search bookmarked questions, answers, or notes..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
            <button
              type="submit"
              className="btn-gradient"
              style={{ width: 'auto', minWidth: '120px', background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)', color: '#fde047' }}
            >
              🔍 Search
            </button>
          </form>

          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginRight: '4px' }}>Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => dispatch(setActiveCategory(cat))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#fde047' : 'rgba(255,255,255,0.15)',
                  background: activeCategory === cat ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? '#fde047' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {cat}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Rating Filter */}
            <select
              className="glass-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              value={minRating}
              onChange={(e) => dispatch(setMinRating(Number(e.target.value)))}
            >
              <option value={0} style={{ background: '#1e1b4b', color: 'white' }}>All Star Ratings</option>
              <option value={1} style={{ background: '#1e1b4b', color: 'white' }}>★ 1+ Stars</option>
              <option value={2} style={{ background: '#1e1b4b', color: 'white' }}>★ 2+ Stars</option>
              <option value={3} style={{ background: '#1e1b4b', color: 'white' }}>★ 3+ Stars</option>
              <option value={4} style={{ background: '#1e1b4b', color: 'white' }}>★ 4+ Stars</option>
              <option value={5} style={{ background: '#1e1b4b', color: 'white' }}>★ 5 Stars Only</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" style={{ borderTopColor: '#fde047' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Fetching bookmarks...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookmarks.length === 0 && (
          <div className="dashboard-center">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔖</div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>No bookmarks found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
              Bookmark responses directly from Chat or Mock Interviews, or click "+ Add Bookmark" above to save custom study notes.
            </p>
          </div>
        )}

        {/* ── Bookmarks List ── */}
        {!loading && bookmarks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookmarks.map((bm) => (
              <div key={bm._id} className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="bookmark-category-badge">{bm.category}</span>
                    <span className="bookmark-source-badge">{bm.source}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Interactive Star Rating */}
                    <div style={{ display: 'flex', gap: '2px', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => handleRatingChange(bm._id, star)}
                          style={{
                            fontSize: '18px',
                            color: star <= bm.starRating ? '#facc15' : 'rgba(255,255,255,0.2)',
                            transition: 'color 0.2s',
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleDelete(bm._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(248,113,113,0.7)',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                      title="Delete Bookmark"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Question */}
                <h3 className="bookmark-question-title">{bm.question}</h3>

                {/* Answer Box */}
                <div className="bookmark-answer-box">
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {bm.answer}
                  </p>
                </div>

                {/* Custom Notes Section */}
                <div style={{ marginTop: '16px' }}>
                  {editingNotesId === bm._id ? (
                    <div>
                      <label className="glass-label">Edit Personal Study Notes:</label>
                      <textarea
                        className="glass-input"
                        rows={3}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add key takeaways, personal code snippets, or reminders..."
                        style={{ marginBottom: '8px', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(bm._id)}
                          style={{ background: '#eab308', border: 'none', color: '#1e1b4b', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '13px', color: bm.customNotes ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>
                        📝 <strong>Notes:</strong> {bm.customNotes || 'No notes added yet'}
                      </div>
                      <button
                        onClick={() => {
                          setEditingNotesId(bm._id);
                          setTempNotes(bm.customNotes || '');
                        }}
                        style={{ background: 'none', border: 'none', color: '#fde047', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {bm.customNotes ? 'Edit' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add Custom Bookmark Modal ── */}
        {showAddModal && (
          <div className="glass-modal-overlay">
            <div className="glass-modal-card" style={{ maxWidth: '550px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: 'white', margin: 0 }}>🔖 Add Custom Bookmark</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateBookmark}>
                <div style={{ marginBottom: '12px' }}>
                  <label className="glass-label">Question / Topic Prompt</label>
                  <input
                    className="glass-input"
                    type="text"
                    required
                    placeholder="e.g. What is closure in JavaScript?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="glass-label">Answer / Model Solution</label>
                  <textarea
                    className="glass-input"
                    rows={4}
                    required
                    placeholder="Type or paste the complete answer explanation..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="glass-label">Category</label>
                    <select
                      className="glass-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as BookmarkCategory)}
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat} style={{ background: '#1e1b4b', color: 'white' }}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="glass-label">Importance Rating</label>
                    <select
                      className="glass-input"
                      value={newStarRating}
                      onChange={(e) => setNewStarRating(Number(e.target.value))}
                    >
                      <option value={1} style={{ background: '#1e1b4b', color: 'white' }}>★ 1 - Low Priority</option>
                      <option value={2} style={{ background: '#1e1b4b', color: 'white' }}>★ 2 - Moderate</option>
                      <option value={3} style={{ background: '#1e1b4b', color: 'white' }}>★ 3 - Important</option>
                      <option value={4} style={{ background: '#1e1b4b', color: 'white' }}>★ 4 - High Priority</option>
                      <option value={5} style={{ background: '#1e1b4b', color: 'white' }}>★ 5 - Must Know</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="glass-label">Personal Notes (Optional)</label>
                  <textarea
                    className="glass-input"
                    rows={2}
                    placeholder="Key reminders, edge cases..."
                    value={newCustomNotes}
                    onChange={(e) => setNewCustomNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gradient"
                    style={{ width: 'auto', minWidth: '140px', background: 'linear-gradient(135deg, #eab308, #f97316)' }}
                  >
                    Save Bookmark 🔖
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;
