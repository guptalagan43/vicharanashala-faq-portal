import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, HelpCircle, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TopFAQsList } from './TopFAQsList';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  view_count?: number;
}

interface Issue {
  id: string;
  status: 'queue' | 'review' | 'resolved';
}

interface AnalyticsDashboardProps {
  onNavigate: (section: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onNavigate }) => {
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch FAQs
    axios.get<FaqItem[]>('http://localhost:3001/api/faqs')
      .then((res) => {
        setTotalFaqs(res.data.length);
        setTotalViews(res.data.reduce((sum, f) => sum + (f.view_count || 0), 0));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // Load issues from localStorage
    const stored = localStorage.getItem('vins_raised_issues');
    if (stored) {
      setIssues(JSON.parse(stored));
    }
  }, []);

  const queueCount = issues.filter((i) => i.status === 'queue').length;
  const reviewCount = issues.filter((i) => i.status === 'review').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  const stats = [
    {
      label: 'Total FAQs',
      value: totalFaqs,
      unit: 'Published',
      icon: <Database size={16} />,
      accent: 'var(--accent)',
    },
    {
      label: 'Total Views',
      value: totalViews,
      unit: 'All Time',
      icon: <Eye size={16} />,
      accent: '#0a84ff',
    },
    {
      label: 'Issues Raised',
      value: issues.length,
      unit: `${queueCount} in queue`,
      icon: <HelpCircle size={16} />,
      accent: '#bf5af2',
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      unit: `${reviewCount} reviewing`,
      icon: <CheckCircle2 size={16} />,
      accent: '#34c759',
    },
  ];

  return (
    <div>
      <div className="admin-section-header">
        <h1>Dashboard</h1>
        <p>Overview of your FAQ portal metrics and activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="admin-stat-card"
            style={{ '--_stat-accent': stat.accent } as React.CSSProperties}
          >
            <div className="admin-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: stat.accent }}>{stat.icon}</span>
              {stat.label}
            </div>
            {isLoading ? (
              <div className="skeleton-pulse" style={{ height: '32px', width: '80px', borderRadius: '4px' }} />
            ) : (
              <div className="admin-stat-value">
                {stat.value}
                <span className="unit">{stat.unit}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <button type="button" className="admin-quick-action" onClick={() => onNavigate('moderation')}>
          <AlertCircle size={14} /> Moderate Queries
          {queueCount > 0 && (
            <span style={{
              background: '#ff3b30',
              color: '#fff',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              {queueCount}
            </span>
          )}
        </button>
        <button type="button" className="admin-quick-action" onClick={() => onNavigate('faqs')}>
          <Database size={14} /> Manage FAQs
        </button>
        <button type="button" className="admin-quick-action" onClick={() => onNavigate('announcements')}>
          <Clock size={14} /> Post Announcement
        </button>
      </div>

      {/* Top FAQs Leaderboard */}
      <TopFAQsList />
    </div>
  );
};

export default AnalyticsDashboard;
