import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, ArrowLeft, Send, CheckCircle2, MessageSquare, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
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
  status: 'queue' | 'review' | 'resolved'; // queue (pulsing yellow), review (purple), resolved (green)
  raisedBy: string;
  raisedByName: string;
  date: string;
  replies: Reply[];
  resolution?: string;
}

const DEFAULT_MOCK_ISSUES: Issue[] = [
  {
    id: "VINS-7821",
    title: "Formatting guidelines for Rosetta Journal submissions",
    category: "Coursework",
    description: "I am trying to format my Rosetta journal entries for Phase 1. Should it be an absolute dump of my diary or do we have to structure it with specific technical sub-headings like 'Aha Moments' and 'Things I learned'?",
    urgency: "low",
    status: "resolved",
    raisedBy: "student@vins.in",
    raisedByName: "Lagan Gupta",
    date: "25 May 2026",
    replies: [
      {
        author: "Mehar Sharma (Peer)",
        role: "student",
        text: "You should structure it under 4 headings: 1. Overview of Task, 2. Hurdles & Struggles, 3. Key Learnings, and 4. Aha Moment. Keep it concise, around 300 words total per entry.",
        time: "25 May 2026, 04:15 PM"
      },
      {
        author: "Dr. Sandeep (Mentor)",
        role: "mentor",
        text: "Mehar's structure is correct. Additionally, make sure to compile all weekly logs into a single PDF before final submission. This will make peer grading smoother.",
        time: "26 May 2026, 10:20 AM"
      }
    ],
    resolution: "Rosetta Journals must be structured under four clean headings (Task Overview, Struggling Hurdles, Key Learnings, Aha Moment) and compiled into a single PDF for weekly review."
  },
  {
    id: "VINS-4390",
    title: "Stipend account bank verification failed",
    category: "Stipend",
    description: "The payment vendor portal for stipend credits shows 'Verification Failed' for my Central Bank of India savings account. I have checked the IFSC code and account numbers twice, and they are accurate. What is the alternative procedure?",
    urgency: "high",
    status: "review",
    raisedBy: "student@vins.in",
    raisedByName: "Lagan Gupta",
    date: "28 May 2026",
    replies: [
      {
        author: "Amit Kumar (Finance)",
        role: "admin",
        text: "We are noticing bank portal API synchronization delays with Central Bank of India. Please upload a cancelled cheque or passbook first page in the portal for manual verification.",
        time: "28 May 2026, 02:40 PM"
      }
    ]
  },
  {
    id: "VINS-1033",
    title: "Signed NOC upload portal button disabled",
    category: "NOC",
    description: "I have successfully downloaded, signed, and scanned the NOC stamp from my university dean. However, the submit button on the Vicharanashala dashboard is disabled and does not let me click upload.",
    urgency: "medium",
    status: "queue",
    raisedBy: "student@vins.in",
    raisedByName: "Lagan Gupta",
    date: "29 May 2026",
    replies: []
  }
];

export const TrackIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'queue' | 'review' | 'resolved'>('all');
  const [replyText, setReplyText] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  // Load issues and populate defaults if empty
  useEffect(() => {
    const stored = localStorage.getItem('vins_raised_issues');
    if (stored) {
      setIssues(JSON.parse(stored));
    } else {
      // Seed default issues
      localStorage.setItem('vins_raised_issues', JSON.stringify(DEFAULT_MOCK_ISSUES));
      setIssues(DEFAULT_MOCK_ISSUES);
    }
  }, []);

  // Sync back to local storage whenever issues list updates
  const saveIssues = (updated: Issue[]) => {
    setIssues(updated);
    localStorage.setItem('vins_raised_issues', JSON.stringify(updated));
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeIssue = issues.find(i => i.id === selectedIssueId) || filteredIssues[0] || null;

  const handlePublishAsFaq = async () => {
    if (!activeIssue) return;
    try {
      await axios.post('http://localhost:3001/api/faqs', {
        question: activeIssue.title,
        answer: activeIssue.resolution || activeIssue.replies[activeIssue.replies.length - 1]?.text || activeIssue.description,
        category: activeIssue.category || 'Other',
      });
      setIsPublished(true);
      setTimeout(() => setIsPublished(false), 3000);
    } catch (err) {
      console.error('Failed to publish as FAQ:', err);
    }
  };

  // Track stats
  const totalRaised = issues.length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const reviewCount = issues.filter(i => i.status === 'review').length;
  const queueCount = issues.filter(i => i.status === 'queue').length;
  const spurtiPoints = resolvedCount * 25 + reviewCount * 10;

  // Handle posting a reply inside the current issue thread
  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeIssue) return;

    const newReply: Reply = {
      author: user.name || user.email.split('@')[0],
      role: user.role,
      text: replyText.trim(),
      time: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updatedIssues = issues.map(issue => {
      if (issue.id === activeIssue.id) {
        return {
          ...issue,
          replies: [...issue.replies, newReply]
        };
      }
      return issue;
    });

    saveIssues(updatedIssues);
    setReplyText('');
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
            <h1 className="portal-title">Track My Issues</h1>
            <p className="portal-subtitle">
              Monitor the status of your queries, collaborate with peer responders, and review senior mentor approvals.
            </p>
          </div>
          <Link to="/raise-issue" className="btn-accent">Raise Another Issue</Link>
        </div>

        {/* Stats Row */}
        <div className="portal-stats-row">
          <div className="portal-stat-card">
            <div className="portal-stat-label">Total Issues</div>
            <div className="portal-stat-value">{totalRaised} <span className="portal-stat-unit">Submitted</span></div>
          </div>
          <div className="portal-stat-card">
            <div className="portal-stat-label">Awaiting Peers</div>
            <div className="portal-stat-value" style={{ color: 'var(--accent)' }}>{queueCount} <span className="portal-stat-unit">In Queue</span></div>
          </div>
          <div className="portal-stat-card">
            <div className="portal-stat-label">Under Review</div>
            <div className="portal-stat-value" style={{ color: '#bf5af2' }}>{reviewCount} <span className="portal-stat-unit">Approving</span></div>
          </div>
          <div className="portal-stat-card">
            <div className="portal-stat-label">Spurti Earned</div>
            <div className="portal-stat-value" style={{ color: '#34c759' }}>+{spurtiPoints} <span className="portal-stat-unit">Points</span></div>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="portal-empty-state">
            <div className="portal-empty-icon">
              <HelpCircle size={32} />
            </div>
            <h2 className="portal-empty-title">No issues raised yet</h2>
            <p className="portal-empty-desc">
              If you have any questions or are stuck on logistics like NOC or stipend verifications, raise a community issue to get peer assistance.
            </p>
            <Link to="/raise-issue" className="btn-accent">Raise an Issue</Link>
          </div>
        ) : (
          <div className="portal-split-layout">
            
            {/* LEFT Panel: Issues list */}
            <aside className="portal-side-list">
              <div className="portal-list-header">
                {/* Search Bar */}
                <div className="portal-search-bar" style={{ marginBottom: '16px' }}>
                  <Search size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by ID, title, category..."
                    className="portal-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  {(['all', 'queue', 'review', 'resolved'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        background: statusFilter === tab ? 'var(--bg-glass)' : 'transparent',
                        color: statusFilter === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab === 'queue' ? 'In Queue' : tab === 'review' ? 'In Review' : tab === 'resolved' ? 'Resolved' : 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable list */}
              <div className="portal-scroll-list">
                {filteredIssues.map((issue) => (
                  <button
                    key={issue.id}
                    className={`portal-list-item ${activeIssue?.id === issue.id ? 'active' : ''}`}
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    <div className="portal-item-meta">
                      <span className="portal-item-id">{issue.id}</span>
                      <span className={`portal-badge portal-badge--${issue.status}`}>
                        {issue.status === 'queue' ? 'In Queue' : issue.status === 'review' ? 'In Review' : 'Resolved'}
                      </span>
                    </div>
                    <div className="portal-item-title">{issue.title}</div>
                    <div className="portal-item-desc">{issue.description}</div>
                  </button>
                ))}

                {filteredIssues.length === 0 && (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    No matching issues found.
                  </div>
                )}
              </div>
            </aside>

            {/* RIGHT Panel: Selected Issue Detail */}
            {activeIssue ? (
              <main className="portal-detail-view">
                <div className="portal-detail-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <span className={`portal-badge portal-badge--${activeIssue.urgency}`} style={{ textTransform: 'uppercase' }}>
                      {activeIssue.urgency} Urgency
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Raised on {activeIssue.date}
                    </span>
                  </div>
                  <h2 className="portal-detail-title">{activeIssue.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>Category: <strong>{activeIssue.category}</strong></span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <span>Status: <strong style={{ color: activeIssue.status === 'resolved' ? '#34c759' : activeIssue.status === 'review' ? '#bf5af2' : 'var(--accent)' }}>
                      {activeIssue.status === 'queue' ? 'Awaiting Peer Help' : activeIssue.status === 'review' ? 'Awaiting Mentor Review' : 'Approved FAQ'}
                    </strong></span>
                  </div>
                </div>

                {/* Conversation bubbles */}
                <div className="portal-bubble-section">
                  {/* Original Question Card */}
                  <div className="portal-bubble-card portal-bubble-card--user">
                    <div className="portal-bubble-meta">
                      <span className="portal-bubble-author">{activeIssue.raisedByName} (Intern)</span>
                      <span className="portal-bubble-time">{activeIssue.date}</span>
                    </div>
                    <div className="portal-bubble-text">{activeIssue.description}</div>
                  </div>

                  {/* Replies */}
                  {activeIssue.replies.map((reply, index) => (
                    <div key={index} className="portal-bubble-card">
                      <div className="portal-bubble-meta">
                        <span 
                          className="portal-bubble-author"
                          style={{ color: reply.role === 'mentor' ? 'var(--accent)' : reply.role === 'admin' ? '#bf5af2' : 'var(--text-primary)' }}
                        >
                          {reply.author} {reply.role === 'mentor' ? '• Mentor' : reply.role === 'admin' ? '• Admin' : '• Peer'}
                        </span>
                        <span className="portal-bubble-time">{reply.time}</span>
                      </div>
                      <div className="portal-bubble-text">{reply.text}</div>
                    </div>
                  ))}
                </div>

                {/* Final Approved Resolution section if resolved */}
                {activeIssue.status === 'resolved' && activeIssue.resolution && (
                  <div 
                    style={{ 
                      background: 'rgba(52,199,89,0.06)', 
                      border: '1px solid rgba(52,199,89,0.2)', 
                      borderRadius: 'var(--radius)', 
                      padding: '24px', 
                      marginBottom: '32px' 
                    }}
                  >
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#34c759', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} /> Official FAQ Resolution
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {activeIssue.resolution}
                    </p>
                    {user.role === 'admin' && (
                      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={handlePublishAsFaq}
                          className="btn-accent"
                          style={{ background: 'var(--accent)', color: 'var(--text-inverse)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
                        >
                          <Sparkles size={14} /> Publish as FAQ
                        </button>
                        {isPublished && (
                          <span style={{ fontSize: '13px', color: '#34c759', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Published to FAQ Portal!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Reply Form */}
                {activeIssue.status !== 'resolved' && (
                  <div className="portal-answer-editor">
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={18} /> Write a Reply
                    </h3>
                    <form onSubmit={handlePostReply}>
                      <textarea
                        required
                        rows={4}
                        placeholder="Add to the conversation or reply to mentor feedback..."
                        className="form-input"
                        style={{ width: '100%', padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical', lineHeight: 1.5, marginBottom: '16px' }}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="btn-accent"
                        >
                          <Send size={14} /> Send Message
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </main>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                No active issues found in the filter view.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
