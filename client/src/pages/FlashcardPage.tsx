import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setDecks,
  setCurrentDeck,
  addDeck,
  updateDeck,
  setLoading,
  setError,
} from '../redux/slices/flashcardSlice';
import {
  generateDeckAPI,
  toggleCardMasteryAPI,
  getDecksAPI,
} from '../services/flashcardService';
import { logout } from '../redux/slices/authSlice';
import type { InterviewDifficulty } from '../types';

const FLASHCARD_TOPICS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js & Express',
  'SQL & Databases',
  'System Design',
  'Data Structures & Algorithms',
  'MERN Stack Architecture',
  'Git & DevOps Basics',
];

const difficultyColors: Record<InterviewDifficulty, { text: string; bg: string; border: string }> = {
  Easy: { text: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)' },
  Medium: { text: '#facc15', bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)' },
  Hard: { text: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' },
};

function FlashcardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { decks, currentDeck, loading, error } = useSelector(
    (state: RootState) => state.flashcard
  );

  const [topicInput, setTopicInput] = useState<string>('React');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [updatingMastery, setUpdatingMastery] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDecks();
  }, [token]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [currentDeck]);

  const fetchDecks = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getDecksAPI(token as string);
      dispatch(setDecks(data));
      if (data.length > 0 && !currentDeck) {
        dispatch(setCurrentDeck(data[0]));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load flashcard decks';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleGenerate = async () => {
    if (!topicInput.trim()) {
      dispatch(setError('Please select or type a topic'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const deck = await generateDeckAPI(token as string, topicInput.trim());
      dispatch(addDeck(deck));
      dispatch(setCurrentDeck(deck));
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to generate flashcard deck';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleToggleMastery = async (mastered: boolean) => {
    if (!currentDeck || !currentDeck.cards[currentCardIndex] || updatingMastery) return;

    const activeCard = currentDeck.cards[currentCardIndex];
    setUpdatingMastery(true);

    try {
      const updatedDeck = await toggleCardMasteryAPI(
        token as string,
        currentDeck._id,
        activeCard.cardId,
        mastered
      );
      dispatch(updateDeck(updatedDeck));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update mastery';
      dispatch(setError(msg));
    } finally {
      setUpdatingMastery(false);
    }
  };

  const handleNextCard = () => {
    if (!currentDeck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % currentDeck.cards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    if (!currentDeck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) =>
        prev === 0 ? currentDeck.cards.length - 1 : prev - 1
      );
    }, 150);
  };

  const handleShuffle = () => {
    if (!currentDeck || currentDeck.cards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * currentDeck.cards.length);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(randomIndex);
    }, 150);
  };

  const activeCard = currentDeck?.cards[currentCardIndex];
  const masteredPercentage = currentDeck
    ? Math.round((currentDeck.masteredCount / currentDeck.cards.length) * 100)
    : 0;

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
            background: 'rgba(168,85,247,0.2)',
            borderColor: 'rgba(168,85,247,0.4)',
            color: '#c084fc',
          }}
        >
          🃏 Flash Cards
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
            <h1 className="dashboard-title">🃏 AI Technical Flashcards</h1>
            <p className="dashboard-subtitle">
              Interactive 3D flip cards with instant AI topic generation & mastery tracking
            </p>
          </div>

          {decks.length > 0 && (
            <select
              className="glass-input"
              style={{ width: 'auto', minWidth: '220px' }}
              value={currentDeck?._id || ''}
              onChange={(e) => {
                const found = decks.find((d) => d._id === e.target.value);
                if (found) dispatch(setCurrentDeck(found));
              }}
            >
              {decks.map((d, i) => (
                <option
                  key={d._id}
                  value={d._id}
                  style={{ background: '#1e1b4b', color: 'white' }}
                >
                  Deck #{decks.length - i}: {d.topic} ({d.masteredCount}/
                  {d.cards.length} Mastered)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error Alert */}
        {error && <div className="glass-alert">⚠️ {error}</div>}

        {/* ── Generator Bar ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <h3 className="dash-card-title">🎴 Generate Flashcard Deck</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {FLASHCARD_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopicInput(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: topicInput === t ? '#c084fc' : 'rgba(255,255,255,0.15)',
                  background: topicInput === t ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)',
                  color: topicInput === t ? '#c084fc' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              className="glass-input"
              type="text"
              placeholder="Or type custom topic (e.g. Next.js App Router, Docker, Microservices)..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
            />
            <button
              className="btn-gradient"
              onClick={handleGenerate}
              disabled={loading || !topicInput.trim()}
              style={{
                width: 'auto',
                minWidth: '220px',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              }}
            >
              {loading ? 'AI Generating Deck...' : 'Generate 10 Cards ✨'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" style={{ borderTopColor: '#c084fc' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Creating 10 technical flashcards with explanations...
            </p>
          </div>
        )}

        {/* ── Active Deck & 3D Flip Card Workspace ── */}
        {!loading && currentDeck && activeCard && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>

            {/* Deck Progress Bar & Controls */}
            <div
              className="dash-card"
              style={{
                width: '100%',
                maxWidth: '650px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <span>
                    Mastery: <strong>{currentDeck.masteredCount} / {currentDeck.cards.length}</strong> ({masteredPercentage}%)
                  </span>
                  <span>
                    Card {currentCardIndex + 1} of {currentDeck.cards.length}
                  </span>
                </div>
                <div className="flashcard-progress-bar">
                  <div
                    className="flashcard-progress-fill"
                    style={{ width: `${masteredPercentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleShuffle}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                🔀 Shuffle
              </button>
            </div>

            {/* 3D Flip Card Scene */}
            <div
              className="flashcard-scene"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`flashcard-card ${isFlipped ? 'flipped' : ''}`}>

                {/* FRONT side */}
                <div className="flashcard-face flashcard-front">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span className="flashcard-category-badge">{activeCard.category}</span>
                    <span
                      className="table-badge"
                      style={{
                        color: difficultyColors[activeCard.difficulty].text,
                        background: difficultyColors[activeCard.difficulty].bg,
                        border: `1px solid ${difficultyColors[activeCard.difficulty].border}`,
                      }}
                    >
                      {activeCard.difficulty}
                    </span>
                  </div>

                  <div className="flashcard-question-text">
                    {activeCard.front}
                  </div>

                  <div className="flashcard-flip-hint">
                    🔄 Click card to flip & reveal answer
                  </div>
                </div>

                {/* BACK side */}
                <div className="flashcard-face flashcard-back">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 600 }}>💡 Answer & Explanation</span>
                    {activeCard.mastered && (
                      <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>✅ Mastered</span>
                    )}
                  </div>

                  <div className="flashcard-answer-text">
                    {activeCard.back}
                  </div>

                  <div className="flashcard-flip-hint">
                    🔄 Click card to return to question
                  </div>
                </div>

              </div>
            </div>

            {/* Mastery & Navigation Actions Bar */}
            <div className="flashcard-action-bar">
              <button
                className="flashcard-nav-btn"
                onClick={handlePrevCard}
              >
                ← Previous
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleToggleMastery(false)}
                  disabled={updatingMastery}
                  className={`flashcard-mastery-btn needs-review ${!activeCard.mastered ? 'active' : ''}`}
                >
                  ❌ Needs Review
                </button>
                <button
                  onClick={() => handleToggleMastery(true)}
                  disabled={updatingMastery}
                  className={`flashcard-mastery-btn mastered ${activeCard.mastered ? 'active' : ''}`}
                >
                  ✅ Mastered
                </button>
              </div>

              <button
                className="flashcard-nav-btn"
                onClick={handleNextCard}
              >
                Next →
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardPage;
