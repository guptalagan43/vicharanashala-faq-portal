import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import '../styles/portal.css';

interface Reply {
  author: string;
  role: 'student' | 'mentor' | 'admin';
  text: string;
  time: string;
}

interface Issue {
  id: string;
  title: string;
  category: string;
  description: string;
  urgency: string;
  status: 'queue' | 'review' | 'resolved';
  raisedBy: string;
  raisedByName: string;
  date: string;
  replies: Reply[];
}

const SEED_PEER_QUESTIONS: Issue[] = [
  {
    id: "VINS-9912",
    title: "Rosetta Journal weekly submission size limit",
    category: "Coursework",
    description: "I am trying to compile all weekly journal entries into a PDF, but with my screenshots, it is exceeding 15MB. The Rosetta portal says file size limit is 10MB. Should I compress the images or is there a Google Drive submission fallback?",
    urgency: "medium",
    status: "queue",
    raisedBy: "rahul@vins.in",
    raisedByName: "Rahul Sharma",
    date: "28 May 2026",
    replies: []
  },
  {
    id: "VINS-3810",
    title: "Git push rejected error on course branch",
    category: "Technical",
    description: "When pushing my Phase 1 codebase, I get 'error: failed to push some refs' because the remote contains work that I do not have locally. Should I run a git pull --rebase or force push? I do not want to overwrite my group project peers' code.",
    urgency: "high",
    status: "queue",
    raisedBy: "priya@vins.in",
    raisedByName: "Priya Patel",
    date: "29 May 2026",
    replies: []
  },
  {
    id: "VINS-2780",
    title: "Official timeline for VINS Certificate distribution",
    category: "Other",
    description: "After completing Phase 4 and achieving the Gold/Platinum badge, what is the exact timeline to get the stamped certificate from IIT Ropar? Is it emailed immediately or physically dispatched to our respective college department?",
    urgency: "low",
    status: "queue",
    raisedBy: "siddharth@vins.in",
    raisedByName: "Siddharth Verma",
    date: "29 May 2026",
    replies: []
  }
];

export const ResolveQuestionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  // Load issues and populate peer questions if empty
  useEffect(() => {
    const stored = localStorage.getItem('vins_raised_issues');
    let loadedIssues: Issue[] = [];
    if (stored) {
      loadedIssues = JSON.parse(stored);
    } else {
      loadedIssues = SEED_PEER_QUESTIONS;
      localStorage.setItem('vins_raised_issues', JSON.stringify(SEED_PEER_QUESTIONS));
    }

    // Merge default seed questions if they do not exist
    const hasSeed = loadedIssues.some(i => i.id === "VINS-9912");
    if (!hasSeed) {
      const merged = [...loadedIssues, ...SEED_PEER_QUESTIONS];
      localStorage.setItem('vins_raised_issues', JSON.stringify(merged));
      setIssues(merged);
    } else {
      setIssues(loadedIssues);
    }
  }, []);

  // Filter issues in queue (raised by others, and status === 'queue')
  const queueQuestions = issues.filter(issue => 
    issue.status === 'queue' && issue.raisedBy !== user.email
  );

  const activeQuestion = queueQuestions.find(i => i.id === selectedIssueId) || queueQuestions[0] || null;

  // Handle posting the answer
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !activeQuestion) return;

    const newReply: Reply = {
      author: `${user.name || user.email.split('@')[0]} (Peer)`,
      role: 'student',
      text: answerText.trim(),
      time: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    // Update issue state in local storage: set status to 'review' and append reply
    const updatedIssues = issues.map(issue => {
      if (issue.id === activeQuestion.id) {
        return {
          ...issue,
          status: 'review' as const,
          replies: [...issue.replies, newReply]
        };
      }
      return issue;
    });

    setIssues(updatedIssues);
    localStorage.setItem('vins_raised_issues', JSON.stringify(updatedIssues));

    setAnswerText('');
    setIsAnswered(true);

    setTimeout(() => {
      setIsAnswered(false);
      setSelectedIssueId(null);
    }, 4000);
  };

  return (
    <div className="portal-page">
      <div className="portal-container">
        
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ArrowLeft size={16} /> Back to Overview
          </Link>
        </div>

        {/* Portal Header */}
        <div className="portal-header">
          <div className="portal-title-area">
            <span className="portal-overline">Intern portal</span>
            <h1 className="portal-title">Resolve a Question</h1>
            <p className="portal-subtitle">
              Help your fellow interns by providing detailed, accurate answers. Earn Spurti Points to unlock exclusive badge levels.
            </p>
          </div>
        </div>

        {/* Available questions stats row */}
        <div className="portal-stats-row" style={{ gridTemplateColumns: '1fr' }}>
          <div className="portal-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="portal-stat-label">Available Questions</div>
            <div className="portal-stat-value" style={{ color: 'var(--accent)' }}>
              {queueQuestions.length} <span className="portal-stat-unit">In Queue</span>
            </div>
          </div>
        </div>

        {isAnswered && (
          <div className="portal-success-banner" style={{ marginBottom: '24px' }}>
            <Sparkles size={18} />
            <span><strong>Success!</strong> Answer submitted for Senior Review.</span>
          </div>
        )}

        {queueQuestions.length === 0 ? (
          <div className="portal-empty-state">
            <div className="portal-empty-icon" style={{ color: '#34c759', background: 'rgba(52,199,89,0.1)' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className="portal-empty-title">All Caught Up!</h2>
            <p className="portal-empty-desc">
              Excellent work. There are no open questions in the community queue right now. Check back later to help your peers!
            </p>
            <Link to="/track-issues" className="btn-secondary">View My Issues</Link>
          </div>
        ) : (
          <div className="portal-split-layout">
            
            {/* LEFT Panel: Available questions queue */}
            <aside className="portal-side-list">
              <div className="portal-list-header">
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} style={{ color: 'var(--accent)' }} /> Open Queue
                </h3>
              </div>

              <div className="portal-scroll-list">
                {queueQuestions.map((q) => (
                  <button
                    key={q.id}
                    className={`portal-list-item ${activeQuestion?.id === q.id ? 'active' : ''}`}
                    onClick={() => setSelectedIssueId(q.id)}
                  >
                    <div className="portal-item-meta">
                      <span className="portal-item-id">{q.id}</span>
                      <span className={`portal-badge portal-badge--${q.urgency}`}>
                        {q.urgency}
                      </span>
                    </div>
                    <div className="portal-item-title">{q.title}</div>
                    <div className="portal-item-desc">{q.description}</div>
                  </button>
                ))}
              </div>
            </aside>

            {/* RIGHT Panel: Resolve question details & form */}
            {activeQuestion ? (
              <main className="portal-detail-view">
                <div className="portal-detail-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <span className="portal-badge portal-badge--queue">
                      Needs Answer
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Raised on {activeQuestion.date}
                    </span>
                  </div>
                  <h2 className="portal-detail-title">{activeQuestion.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>Category: <strong>{activeQuestion.category}</strong></span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <span>Author: <strong>{activeQuestion.raisedByName}</strong></span>
                  </div>
                </div>

                <div className="portal-bubble-section">
                  {/* Detailed description */}
                  <div className="portal-bubble-card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                    <div className="portal-bubble-meta">
                      <span className="portal-bubble-author">{activeQuestion.raisedByName}</span>
                      <span className="portal-bubble-time">{activeQuestion.date}</span>
                    </div>
                    <div className="portal-bubble-text" style={{ whiteSpace: 'pre-wrap' }}>
                      {activeQuestion.description}
                    </div>
                  </div>
                </div>

                {/* Markdown Answer Editor */}
                <div className="portal-answer-editor">
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} style={{ color: 'var(--accent)' }} /> Write Your Peer Resolution
                  </h3>
                  
                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      background: 'var(--accent-glow)', 
                      border: '1px solid var(--border-active)', 
                      borderRadius: 'var(--radius)', 
                      padding: '14px 16px', 
                      marginBottom: '16px' 
                    }}
                  >
                    <AlertCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <strong>Mentorship Guidelines:</strong> Provide step-by-step technical steps. If providing a git command or file structure, wrap them in backticks (`code`). Vague or incorrect answers will be flagged by senior reviewers and penalty points will be applied.
                    </span>
                  </div>

                  <form onSubmit={handleSubmitAnswer}>
                    <textarea
                      required
                      rows={6}
                      placeholder="Write a clear, thorough explanation to resolve this question..."
                      className="form-input"
                      style={{ width: '100%', padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical', lineHeight: 1.5, marginBottom: '16px' }}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button
                        type="submit"
                        disabled={!answerText.trim()}
                        className="btn-accent"
                      >
                        <Send size={14} /> Submit Peer Resolution
                      </button>
                    </div>
                  </form>
                </div>
              </main>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                Select a question from the left queue to get started.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
