import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setCurrentInterview,
  setCurrentQuestion,
  addQuestion,
  updateCurrentInterview,
  resetInterview,
} from '../redux/slices/interviewSlice';
import {
  startInterviewAPI,
  submitAnswerAPI,
  completeInterviewAPI,
} from '../services/interviewService';
import type {
  InterviewTopic,
  InterviewDifficulty,
  InterviewDuration,
  InterviewCompany,
} from '../types';

const TOPICS: InterviewTopic[] = [
  'React', 'JavaScript', 'TypeScript', 'Node.js',
  'Express', 'MongoDB', 'MERN', 'DSA',
  'System Design', 'SQL', 'HR Interview',
];

const COMPANY_CATEGORIES: { name: string; companies: InterviewCompany[] }[] = [
  {
    name: 'FAANG / Big Tech',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix'],
  },
  {
    name: 'Indian Product',
    companies: ['Zoho', 'Freshworks'],
  },
  {
    name: 'Indian Service',
    companies: ['TCS', 'Infosys', 'Accenture', 'Cognizant', 'Wipro', 'Capgemini'],
  },
];

const DIFFICULTIES: InterviewDifficulty[] = ['Easy', 'Medium', 'Hard'];
const DURATIONS: InterviewDuration[] = [15, 30, 60];

const difficultyColor: Record<InterviewDifficulty, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

function InterviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { currentInterview, currentQuestion, questions } = useSelector(
    (state: RootState) => state.interview
  );

  const [topic, setTopic] = useState<InterviewTopic>('JavaScript');
  const [company, setCompany] = useState<InterviewCompany | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Easy');
  const [duration, setDuration] = useState<InterviewDuration>(15);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastEvaluation, setLastEvaluation] = useState<{
    evaluation: string;
    score: number;
  } | null>(null);
  const [phase, setPhase] = useState<'setup' | 'interview' | 'completing'>('setup');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(resetInterview());
  }, []);

  useEffect(() => {
    if (phase === 'interview' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await startInterviewAPI(
        token as string,
        topic,
        difficulty,
        duration,
        company
      );
      dispatch(setCurrentInterview(data.interview));
      dispatch(setCurrentQuestion(data.firstQuestion));
      dispatch(addQuestion(data.firstQuestion));
      setTimeLeft(duration * 60);
      setPhase('interview');
    } catch (err) {
      console.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentInterview || loading) return;
    setLoading(true);
    const content = answer.trim();
    setAnswer('');
    try {
      const data = await submitAnswerAPI(
        token as string,
        currentInterview._id,
        content
      );
      setLastEvaluation({ evaluation: data.evaluation, score: data.score });
      dispatch(setCurrentQuestion(data.nextQuestion));
      dispatch(addQuestion(data.nextQuestion));
    } catch (err) {
      console.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentInterview || phase === 'completing') return;
    setPhase('completing');
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const data = await completeInterviewAPI(
        token as string,
        currentInterview._id
      );
      dispatch(updateCurrentInterview(data));
      navigate(`/interview/${currentInterview._id}/report`);
    } catch (err) {
      console.error('Failed to complete interview');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (phase === 'setup') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '680px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '40px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <button
            onClick={() => navigate('/chat')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '24px',
              padding: 0,
            }}
          >
            ← Back to Chat
          </button>

          <h2 style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
          }}>
            Mock Interview
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
            Configure your interview session
          </p>

          {/* Topic */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
              Select Topic
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: topic === t ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                    background: topic === t ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    color: topic === t ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Target Company (Optional) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Target Company <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(Optional — custom AI interview style)</span>
              </label>
              {company && (
                <button
                  onClick={() => setCompany(undefined)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {COMPANY_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    {cat.name}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cat.companies.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCompany(company === c ? undefined : c)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: company === c ? '#3b82f6' : 'rgba(255,255,255,0.12)',
                          background: company === c ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.04)',
                          color: company === c ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: company === c ? '600' : '400',
                          transition: 'all 0.2s',
                        }}
                      >
                        🏢 {c}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
              Difficulty
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: difficulty === d ? difficultyColor[d] : 'rgba(255,255,255,0.15)',
                    background: difficulty === d ? `${difficultyColor[d]}22` : 'rgba(255,255,255,0.05)',
                    color: difficulty === d ? difficultyColor[d] : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
              Duration
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: duration === d ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                    background: duration === d ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    color: duration === d ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Starting...' : company ? `Start ${company} Interview` : 'Start Interview'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(15,12,41,0.6)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '700',
            fontSize: '16px',
          }}>
            {topic} Interview
          </span>
          {company && (
            <span style={{
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.4)',
              background: 'rgba(59,130,246,0.15)',
              fontWeight: '600',
            }}>
              🏢 {company}
            </span>
          )}
          <span style={{
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            color: difficultyColor[difficulty],
            border: `1px solid ${difficultyColor[difficulty]}44`,
            background: `${difficultyColor[difficulty]}11`,
          }}>
            {difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '20px',
            color: timeLeft < 60 ? '#ef4444' : 'white',
            fontWeight: '700',
          }}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleComplete}
            disabled={phase === 'completing'}
            style={{
              padding: '8px 16px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {phase === 'completing' ? 'Completing...' : 'End Interview'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
      }}>
        {/* Question number */}
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
          Question {currentQuestion?.questionNumber}
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            fontSize: '16px',
            lineHeight: '1.6',
          }}>
            {currentQuestion.question}
          </div>
        )}

        {/* Last Evaluation */}
        {lastEvaluation && (
          <div style={{
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                Previous Score:
              </span>
              <span style={{
                color: lastEvaluation.score >= 7 ? '#22c55e' : lastEvaluation.score >= 4 ? '#f59e0b' : '#ef4444',
                fontWeight: '700',
                fontSize: '16px',
              }}>
                {lastEvaluation.score}/10
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>
              {lastEvaluation.evaluation}
            </p>
          </div>
        )}

        {/* Answer Input */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here... (Enter to submit)"
            disabled={loading || phase === 'completing'}
            rows={5}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '15px',
              resize: 'vertical',
              outline: 'none',
              lineHeight: '1.6',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || loading || phase === 'completing'}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !answer.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !answer.trim() || loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Evaluating...' : 'Submit Answer →'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center' }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''} asked
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;