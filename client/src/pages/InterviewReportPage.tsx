import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import { setCurrentInterview, setQuestions } from '../redux/slices/interviewSlice';
import { getInterviewAPI } from '../services/interviewService';

function InterviewReportPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { currentInterview, questions } = useSelector(
    (state: RootState) => state.interview
  );

  useEffect(() => {
    if (id) loadInterview(id);
  }, [id]);

  const loadInterview = async (interviewId: string) => {
    try {
      const data = await getInterviewAPI(token as string, interviewId);
      dispatch(setCurrentInterview(data.interview));
      dispatch(setQuestions(data.questions));
    } catch (err) {
      console.error('Failed to load interview');
    }
  };

  if (!currentInterview) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}>
        Loading report...
      </div>
    );
  }

  const scoreColor = currentInterview.score && currentInterview.score >= 70
    ? '#22c55e'
    : currentInterview.score && currentInterview.score >= 40
    ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: '24px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/chat')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
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
            marginBottom: '4px',
          }}>
            Interview Report
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {currentInterview.topic} · {currentInterview.difficulty} · {currentInterview.duration} mins
          </p>
        </div>

        {/* Score Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: '700',
            color: scoreColor,
            lineHeight: 1,
            marginBottom: '8px',
          }}>
            {currentInterview.score}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '20px' }}>
            out of 100
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '15px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            {currentInterview.feedback}
          </p>
        </div>

        {/* Strong and Weak Areas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Strong Areas */}
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{ color: '#22c55e', marginBottom: '12px', fontSize: '15px' }}>
              ✅ Strong Areas
            </h4>
            {currentInterview.strongAreas?.map((area, i) => (
              <div key={i} style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                padding: '6px 0',
                borderBottom: i < (currentInterview.strongAreas?.length || 0) - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                {area}
              </div>
            ))}
          </div>

          {/* Weak Areas */}
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '15px' }}>
              ⚠️ Weak Areas
            </h4>
            {currentInterview.weakAreas?.map((area, i) => (
              <div key={i} style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                padding: '6px 0',
                borderBottom: i < (currentInterview.weakAreas?.length || 0) - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                {area}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div style={{
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h4 style={{ color: '#a78bfa', marginBottom: '12px', fontSize: '15px' }}>
            💡 Suggestions
          </h4>
          {currentInterview.suggestions?.map((s, i) => (
            <div key={i} style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              padding: '8px 0',
              borderBottom: i < (currentInterview.suggestions?.length || 0) - 1
                ? '1px solid rgba(255,255,255,0.05)'
                : 'none',
              display: 'flex',
              gap: '8px',
            }}>
              <span style={{ color: '#8b5cf6', flexShrink: 0 }}>{i + 1}.</span>
              {s}
            </div>
          ))}
        </div>

        {/* Questions and Answers */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '15px' }}>
            📝 Questions & Answers
          </h4>
          {questions.filter(q => q.answer).map((q, i) => (
            <div key={q._id} style={{
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: i < questions.filter(q => q.answer).length - 1
                ? '1px solid rgba(255,255,255,0.07)'
                : 'none',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: 'rgba(139,92,246,0.2)',
                  color: '#a78bfa',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  Q{q.questionNumber}
                </span>
                {q.score !== undefined && (
                  <span style={{
                    color: q.score >= 7 ? '#22c55e' : q.score >= 4 ? '#f59e0b' : '#ef4444',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}>
                    {q.score}/10
                  </span>
                )}
              </div>
              <p style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>
                {q.question}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>
                <strong style={{ color: 'rgba(255,255,255,0.4)' }}>Your answer: </strong>
                {q.answer}
              </p>
              {q.evaluation && (
                <p style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '13px',
                  fontStyle: 'italic',
                }}>
                  <strong style={{ color: 'rgba(255,255,255,0.3)' }}>Feedback: </strong>
                  {q.evaluation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/interview')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Start New Interview
          </button>
          <button
            onClick={() => navigate('/chat')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Back to Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewReportPage;